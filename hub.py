"""Public catalog builder. No credentials or game-folder writes."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import re
import tempfile
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen
import zipfile

ROOT = Path(__file__).resolve().parent
SEMVER = re.compile(r'^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$')


def version_key(value):
    match = SEMVER.fullmatch(value.removeprefix('v'))
    if not match:
        raise ValueError('Invalid semantic version')
    major, minor, patch, pre = match.groups()
    identifiers = pre.split('.') if pre else []
    if any(x.isdigit() and len(x) > 1 and x.startswith('0') for x in identifiers):
        raise ValueError('Leading zero in prerelease')
    return (int(major), int(minor), int(patch), not pre,
            tuple((0, int(x)) if x.isdigit() else (1, x) for x in identifiers))


def download_url(url, repository):
    parsed = urlsplit(url)
    prefix = f'/{repository}/releases/download/'
    if (parsed.scheme != 'https' or parsed.netloc != 'github.com'
            or parsed.query or parsed.fragment or not parsed.path.startswith(prefix)
            or len(parsed.path[len(prefix):].split('/')) != 2
            or any(x in parsed.path.lower() for x in ('%2e', '%2f', '%5c', '\\'))
            or any(x in ('.', '..', '') for x in parsed.path.split('/')[1:])):
        raise ValueError('Download must be an official versioned GitHub Release asset')
    return url


def validate(catalog):
    from jsonschema import Draft202012Validator
    schema = json.loads((ROOT / 'catalog/schema.json').read_text())
    Draft202012Validator(schema).validate(catalog)
    ids = set()
    for plugin in catalog['mods']:
        if plugin['id'] in ids:
            raise ValueError('Duplicate plugin ID')
        ids.add(plugin['id'])
        if not (ROOT / 'web' / plugin['image']).is_file():
            raise ValueError('Missing cover image')
        for channel in ('stable', 'beta'):
            release = plugin.get(channel)
            if release is None:
                continue
            key = version_key(release['version'])
            if channel == 'stable' and not key[3]:
                raise ValueError('Prerelease in stable channel')
            download_url(release['download_url'], plugin['repository'])
            expected_notes = f'https://github.com/{plugin["repository"]}/releases/tag/v{release["version"]}'
            if release['release_url'] not in (expected_notes, expected_notes.replace('/tag/v', '/tag/')):
                raise ValueError('Invalid release notes URL')
    return catalog


def check_package(data, requires, sha256):
    """A new release must carry every file its plugin needs at runtime (sounds, INI, premaps...).

    Entries may sit under a top folder (name-1.2.3/plugins/x.dll). `dir/` needs at least one file inside."""
    if hashlib.sha256(data).hexdigest() != sha256:
        raise ValueError('Downloaded package does not match its SHA-256')
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            if archive.testzip() is not None:
                raise ValueError('Corrupt package')
            names = ['/' + n for n in archive.namelist() if not n.endswith('/')]
    except zipfile.BadZipFile:
        raise ValueError('Package is not a ZIP') from None
    missing = [r for r in requires
               if not any((('/' + r) in n and not n.endswith('/' + r.rstrip('/'))) if r.endswith('/')
                          else n.endswith('/' + r) for n in names)]
    if missing:
        raise ValueError('Package is missing required files: ' + ', '.join(missing))


def download_asset(url, limit=200 * 1024 * 1024):
    request = Request(download_url(url, '/'.join(urlsplit(url).path.split('/')[1:3])), headers={'User-Agent': 'Mod-Hub'})
    with urlopen(request, timeout=60) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError('Package too large')
    return data


def build(plugins, fetch, previous=None, download=None):
    # The curated plugins.json is the allowlist; the schema restricts repositories to the Rhaiderr owner.
    published = {(p['id'], p[c]['version']): p[c]['sha256'] for p in (previous or {}).get('mods', [])
                 for c in ('stable', 'beta') if p.get(c)}
    result = []
    for plugin in plugins:
        repo = plugin.get('repository')
        if repo is None:  # Steam Workshop item: version is curated, Steam handles updates.
            result.append(plugin)
            continue
        if not re.fullmatch(r'Rhaiderr/[A-Za-z0-9._-]+', repo):
            raise ValueError('Repository outside the Rhaiderr account')
        releases = fetch(repo)
        channels = {'stable': None, 'beta': None}
        for release in releases:
            if release['draft']:
                continue
            key = version_key(release['tag_name'])
            channel = 'beta' if release['prerelease'] or not key[3] else 'stable'
            assets = [a for a in release['assets'] if a['name'] == plugin['asset'] and a['state'] == 'uploaded']
            if not assets:
                continue
            asset = assets[0]
            digest = asset.get('digest') or ''
            if not re.fullmatch(r'sha256:[a-f0-9]{64}', digest):
                raise ValueError('Missing SHA-256; retain previous catalog')
            url = download_url(asset['browser_download_url'], repo)
            expected = f'https://github.com/{repo}/releases/download/{quote(release["tag_name"], safe="")}/{quote(plugin["asset"], safe="")}'
            if url != expected:
                raise ValueError('Asset does not match its release')
            if published.get((plugin['id'], release['tag_name'].removeprefix('v')), digest[7:]) != digest[7:]:
                raise ValueError('Published package changed without a new version; retain previous catalog')
            current = channels[channel]
            if current is None or key > version_key(current['version']):
                channels[channel] = {'version': release['tag_name'].removeprefix('v'),
                    'published_at': release['published_at'], 'download_url': url,
                    'sha256': digest[7:],
                    'release_url': f'https://github.com/{repo}/releases/tag/{quote(release["tag_name"], safe="")}'}
        if download is not None and plugin.get('kind') == 'plugin':
            requires = plugin.get('package_requires') or [plugin['dll']]
            if plugin['dll'] not in requires:
                raise ValueError('package_requires must list the plugin DLL')
            for release in filter(None, channels.values()):
                if (plugin['id'], release['version']) not in published:  # only new packages are downloaded
                    check_package(download(release['download_url']), requires, release['sha256'])
        # Release bodies can contain historical personal data; link to notes instead.
        result.append({**plugin, **channels})
    return validate({'schema_version': 2, 'mods': result})


def fetch_releases(repo):
    releases = []
    for page in range(1, 101):
        request = Request(f'https://api.github.com/repos/{repo}/releases?per_page=100&page={page}',
                          headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'Mod-Hub'})
        with urlopen(request, timeout=20) as response:
            batch = json.load(response)
        releases.extend(batch)
        if len(batch) < 100:
            return releases
    raise ValueError('Release pagination limit exceeded')


def write_catalog(catalog, path):
    content = json.dumps(validate(catalog), ensure_ascii=False, indent=2) + '\n'
    if path.exists() and path.read_text() == content:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent, delete=False) as file:
            temporary = Path(file.name)
            file.write(content)
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def verify_file(path, expected):
    if not re.fullmatch(r'[a-f0-9]{64}', expected):
        raise ValueError('Invalid SHA-256')
    with path.open('rb') as file:
        digest = hashlib.sha256()
        for chunk in iter(lambda: file.read(1024 * 1024), b''):
            digest.update(chunk)
        if digest.hexdigest() != expected:
            raise ValueError('SHA-256 mismatch')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['sync', 'validate', 'verify'])
    parser.add_argument('--fixtures', type=Path, help='Offline release snapshots directory')
    parser.add_argument('--file', type=Path)
    parser.add_argument('--sha256')
    args = parser.parse_args()
    path = ROOT / 'web/catalog.json'
    if args.command == 'sync':
        fetch = fetch_releases if args.fixtures is None else lambda repo: json.loads((args.fixtures / (repo.split('/')[1] + '.json')).read_text())
        plugins = json.loads((ROOT / 'catalog/plugins.json').read_text())
        previous = json.loads(path.read_text()) if path.exists() else None
        download = None if args.fixtures is not None else download_asset
        write_catalog(build(plugins, fetch, previous, download), path)
        print('Catalog synchronized and validated')
    elif args.command == 'validate':
        validate(json.loads(path.read_text()))
        print('Catalog valid')
    else:
        if args.file is None or args.sha256 is None:
            parser.error('verify requires --file and --sha256')
        verify_file(args.file, args.sha256)
        print('SHA-256 verified')


if __name__ == '__main__':
    main()
