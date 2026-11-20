import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import URLError
import hub


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.plugins = json.loads((hub.ROOT / 'catalog/plugins.json').read_text())
        self.fetch = lambda repo: json.loads((hub.ROOT / 'tests' / (repo.split('/')[1]+'.json')).read_text())

    def test_real_releases_and_channels(self):
        catalog = hub.build(self.plugins, self.fetch)
        mods = {mod['id']: mod for mod in catalog['mods']}
        self.assertEqual(mods['tire-wear']['stable']['version'], '0.3.2')
        self.assertEqual(mods['tire-wear']['beta']['version'], '0.3.2-beta')
        self.assertEqual(mods['truck-dirt']['stable']['version'], '0.1.6')
        self.assertIsNone(mods['brake-fade']['stable'])
        self.assertEqual(mods['brake-fade']['beta']['version'], '0.4.0-rc6')
        self.assertEqual(mods['clima-real']['kind'], 'mod')
        self.assertEqual(mods['carreta-guerra']['version'], '0.5.0')
        self.assertNotIn('stable', mods['carreta-guerra'])

    def test_semver_order_and_invalid_versions(self):
        versions = ['1.0.0-alpha', '1.0.0-alpha.2', '1.0.0-alpha.10', '1.0.0-beta', '1.0.0-rc.1', '1.0.0', '1.0.10', '1.1.0']
        self.assertEqual(sorted(reversed(versions), key=hub.version_key), versions)
        for value in ['1.0', '01.0.0', '1.0.0-01']:
            with self.assertRaises(ValueError): hub.version_key(value)

    def test_no_release_and_drafts(self):
        self.assertIsNone(hub.build(self.plugins, lambda _: [])['mods'][2]['stable'])
        def draft(repo):
            releases = self.fetch(repo)
            for r in releases: r['draft'] = True
            return releases
        self.assertIsNone(hub.build(self.plugins, draft)['mods'][2]['beta'])

    def test_new_release_and_unsorted_history(self):
        def updated(repo):
            releases = self.fetch(repo)
            if repo.endswith('ets2-truck-dirt'):
                new = copy.deepcopy(releases[0])
                new['tag_name'] = 'v0.1.10'
                new['assets'][0]['browser_download_url'] = new['assets'][0]['browser_download_url'].replace('v0.1.6', 'v0.1.10')
                releases.append(new)
            return releases
        truck_dirt = next(mod for mod in hub.build(self.plugins, updated)['mods'] if mod['id'] == 'truck-dirt')
        self.assertEqual(truck_dirt['stable']['version'], '0.1.10')

    def test_invalid_catalog_and_duplicate_ids(self):
        catalog = hub.build(self.plugins, self.fetch)
        from jsonschema import ValidationError
        with self.assertRaises(ValidationError): hub.validate({'schema_version':1,'mods':[]})
        without_dll = copy.deepcopy(catalog)
        del without_dll['mods'][0]['dll']
        with self.assertRaises(ValidationError): hub.validate(without_dll)
        missing_image = copy.deepcopy(catalog)
        missing_image['mods'][0]['image'] = 'assets/missing.jpg'
        with self.assertRaises(ValueError): hub.validate(missing_image)
        catalog['mods'].append(copy.deepcopy(catalog['mods'][0]))
        with self.assertRaises(ValueError): hub.validate(catalog)

    def test_untrusted_urls(self):
        base = 'https://github.com/Rhaiderr/ets2-tire-wear/releases/download/v1.0.0/file.zip'
        hub.download_url(base, 'Rhaiderr/ets2-tire-wear')
        for url in [base.replace('https:', 'http:'), base.replace('github.com', 'github.com.evil.test'), base+'?token=x', base.replace('file.zip','../file.zip'), base.replace('file.zip','%2e%2e.zip')]:
            with self.assertRaises(ValueError): hub.download_url(url, 'Rhaiderr/ets2-tire-wear')

    def test_missing_hash_and_private_repo(self):
        def missing(repo):
            releases = self.fetch(repo)
            releases[0]['assets'][0]['digest'] = None
            return releases
        with self.assertRaises(ValueError): hub.build(self.plugins, missing)
        self.plugins[0]['repository'] = 'someone-else/ets2-tire-wear'
        with self.assertRaises(ValueError): hub.build(self.plugins, self.fetch)

    def test_replaced_package_under_same_version_is_rejected(self):
        previous = hub.build(self.plugins, self.fetch)
        self.assertEqual(hub.build(self.plugins, self.fetch, previous), previous)
        def replaced(repo):
            releases = self.fetch(repo)
            releases[0]['assets'][0]['digest'] = 'sha256:' + '0'*64
            return releases
        with self.assertRaises(ValueError): hub.build(self.plugins, replaced, previous)

    def test_network_failure_preserves_previous_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'manifest.json'
            hub.write_catalog(hub.build(self.plugins, self.fetch), path)
            before = path.read_bytes()
            with patch('hub.urlopen', side_effect=URLError('offline')):
                with self.assertRaises(URLError):
                    hub.write_catalog(hub.build(self.plugins, hub.fetch_releases), path)
            self.assertEqual(path.read_bytes(), before)
            self.assertEqual(list(Path(tmp).iterdir()), [path])

    def test_hash_verification(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'file.zip'
            path.write_bytes(b'package')
            hub.verify_file(path, hashlib.sha256(b'package').hexdigest())
            with self.assertRaises(ValueError): hub.verify_file(path, '0'*64)


if __name__ == '__main__':
    unittest.main()
