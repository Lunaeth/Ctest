from contextlib import closing
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest

from server.app import SCHEMA
from server.backup import copy_database, create_backup


class BackupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / "live.sqlite3"
        self.live = sqlite3.connect(self.source)
        self.live.execute("PRAGMA journal_mode=WAL")
        self.live.executescript(SCHEMA)
        self.live.execute("INSERT INTO users VALUES (1,'fixture-user','test-hash',1)")
        self.entries = json.dumps({"question-app.progress": '{"ncaAiio":{"85":{"correct":true}}}',
                                   "question-app.favorites": '{"ccnpDcai":[49]}',
                                   "question-app.mistakes": '{"ncaAiio":[104]}'})
        self.live.execute("INSERT INTO progress VALUES (1,7,?,2,'write-identifier')", (self.entries,))
        self.live.commit()

    def tearDown(self):
        self.live.close()
        self.temp.cleanup()

    def test_online_wal_backup_and_restore_preserve_committed_account_records(self):
        backup = create_backup(self.source, self.root / "backups")
        self.live.execute("UPDATE progress SET revision=8, entries='{}'")
        self.live.commit()
        restored = copy_database(backup, self.root / "restored.sqlite3")
        with closing(sqlite3.connect(restored)) as db:
            self.assertEqual(db.execute("PRAGMA integrity_check").fetchone(), ("ok",))
            self.assertEqual(db.execute("SELECT username FROM users").fetchone(), ("fixture-user",))
            self.assertEqual(db.execute("SELECT revision,entries,write_id FROM progress").fetchone(),
                             (7, self.entries, "write-identifier"))
        self.assertEqual(self.live.execute("SELECT revision FROM progress").fetchone(), (8,))
        if os.name != 'nt':
            self.assertEqual(backup.stat().st_mode & 0o777, 0o600)
            self.assertEqual(backup.parent.stat().st_mode & 0o777, 0o700)

    def test_restore_refuses_existing_file_and_missing_source_never_creates_database(self):
        destination = self.root / "existing.sqlite3"
        destination.write_text("preserve this file")
        with self.assertRaises(FileExistsError):
            copy_database(self.source, destination)
        self.assertEqual(destination.read_text(), "preserve this file")
        with self.assertRaises(FileNotFoundError):
            copy_database(self.root / "missing.sqlite3", self.root / "not-created.sqlite3")
        self.assertFalse((self.root / "not-created.sqlite3").exists())

    def test_retention_only_prunes_verified_backup_names_after_successful_copy(self):
        folder = self.root / "backups"
        first = create_backup(self.source, folder, retain=2)
        os.utime(first, (100, 100))
        second = create_backup(self.source, folder, retain=2)
        note = folder / "manual-backup.sqlite3"
        note.write_text("preserve")
        third = create_backup(self.source, folder, retain=2)
        self.assertFalse(first.exists())
        self.assertTrue(second.exists() and third.exists() and note.exists())
        corrupt = self.root / "corrupt.sqlite3"
        corrupt.write_text("not a database")
        with self.assertRaises(sqlite3.DatabaseError):
            create_backup(corrupt, folder, retain=1)
        self.assertTrue(second.exists() and third.exists())
        self.assertEqual(len(list(folder.glob('accounts-*.sqlite3'))), 2)


if __name__ == '__main__':
    unittest.main()
