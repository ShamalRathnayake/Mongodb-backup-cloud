import 'jest';
import fs from 'fs';
import Backup from '../backup';
import { generatePathOptions } from '../functions';
import { URIOptions } from '../../types/types';
import path from 'path';

const defaultBackupPath = './backup';
let deletePath = '';

describe('Database backup process with connection string', () => {
  const backupDbFiles = async (
    options: URIOptions,
    backupPath: string = defaultBackupPath,
    isArchive: boolean = false,
    deleteBackup: boolean = false
  ) => {
    const filePaths = generatePathOptions(options);

    if (deleteBackup) {
      fs.mkdirSync(filePaths.oldBackupDir, { recursive: true });
      fs.writeFileSync(filePaths.oldBackupPath, '');
      if (!options.schedule) options.oldBackupPath = filePaths.oldBackupDir;
    }

    const output = await Backup.withConnectionString(options);

    expect(fs.existsSync(backupPath)).toBe(true);

    const dateFolder = fs
      .readdirSync(backupPath, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name)[0];

    expect(`${backupPath}/${dateFolder}` === filePaths.backupDir).toBe(true);

    if (!isArchive) {
      const timeFolder = fs
        .readdirSync(`${backupPath}/${dateFolder}`, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => dir.name)[0];

      expect(`${backupPath}/${dateFolder}/${timeFolder}` === filePaths.backupPath).toBe(true);
    } else {
      const file = fs.readdirSync(`${backupPath}/${dateFolder}`, { withFileTypes: true })[0];

      expect(`${backupPath}/${dateFolder}/${file.name}` === filePaths.backupPath).toBe(true);
    }

    return { filePaths, output };
  };

  test('local database', async () => {
    try {
      const options: URIOptions = {
        uri: 'mongodb://127.0.0.1:27017',
        database: 'test',
      };

      await backupDbFiles(options);
      deletePath = defaultBackupPath;
    } catch (error) {
      console.log(error);
    }
  });

  /* test('cloud database', async () => {
    try {
      const options: URIOptions = {
        uri: 'mongodb://',
        database: 'test',
      };

      const { filePaths, output } = await backupDbFiles(options);

      console.log(output);
      removeDbFiles();
    } catch (error) {
      console.log(error);
    }
  }); */

  test('custom output path', async () => {
    const backupPath = './customPath';

    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'test',
      outputPath: backupPath,
    };

    await backupDbFiles(options, backupPath);
    deletePath = backupPath;
  });

  test('gzip option', async () => {
    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'test',
      gzip: true,
    };

    const { filePaths, output } = await backupDbFiles(options);

    const backupDbPath = `${filePaths.backupPath}/${options.database}`;

    const files = fs.readdirSync(backupDbPath, { withFileTypes: true }).map((file) => {
      if (file.isFile() && path.extname(path.join(backupDbPath, file.name)) === '.gz') return true;
      return false;
    });

    expect(files).not.toContain(false);

    deletePath = defaultBackupPath;
  });

  test('archive option', async () => {
    const archivePath = 'test-archive';

    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'test',
      archive: archivePath,
    };

    await backupDbFiles(options, archivePath, true);

    deletePath = archivePath;
  });

  test('archive extension option', async () => {
    const archivePath = 'test-archive';
    const extension = 'rar';

    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'test',
      archive: archivePath,
      archiveExtension: extension,
    };

    const { filePaths } = await backupDbFiles(options, archivePath, true);

    expect(path.extname(filePaths.backupPath) === `.${extension}`).toBe(true);

    deletePath = archivePath;
  });

  test('remove old backups option', async () => {
    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'test',
      removeOldBackups: true,
      oldBackupPath: '',
    };

    const { filePaths } = await backupDbFiles(options, defaultBackupPath, false, true);

    expect(fs.existsSync(filePaths.oldBackupPath)).toBe(false);
    expect(fs.existsSync(filePaths.oldBackupDir)).toBe(false);

    deletePath = defaultBackupPath;
  });

  test('database option', async () => {
    const databaseName = 'backup_test';
    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: databaseName,
    };

    const { filePaths } = await backupDbFiles(options);

    expect(
      fs.readdirSync(filePaths.backupPath, { withFileTypes: true })[0].name === databaseName
    ).toBe(true);

    deletePath = defaultBackupPath;
  });

  test('collection option', async () => {
    const collection = 'cars';
    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'backup_test',
      collection,
    };

    const { filePaths } = await backupDbFiles(options);

    expect(
      fs
        .readdirSync(path.join(filePaths.backupPath, 'backup_test'), { withFileTypes: true })
        .map((a) => a.name)
        .includes(`${collection}.bson`)
    ).toBe(true);

    deletePath = defaultBackupPath;
  });

  test('exclude collections option', async () => {
    const collection = 'cars';
    const options: URIOptions = {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'backup_test',
      excludeCollection: [collection],
    };

    const { filePaths } = await backupDbFiles(options);

    expect(
      fs
        .readdirSync(path.join(filePaths.backupPath, 'backup_test'), { withFileTypes: true })
        .map((a) => a.name)
        .includes(`${collection}.bson`)
    ).toBe(false);

    deletePath = defaultBackupPath;
  });

  afterEach(() => {
    fs.rmSync(deletePath, { recursive: true, force: true });
  });
});
