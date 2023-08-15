/* eslint-disable */
// @ts-nocheck

import logConfig from '../../../backup/config/logConfig';
import { BackupOptions } from '../../../types/types';
import { BackupLogger } from '../../Logger/logger';
import PathGenerator from '../pathGenerator';
import * as fs from 'fs';

// Mock Logger and TimestampGenerator if needed
jest.mock('../../Logger/logger', () => ({
  BackupLogger: {
    log: jest.fn(),
  },
}));

jest.mock('fs');

jest.mock('../../timestampGenerator/timestampGenerator', () => ({
  __esModule: true,
  default: class MockTimestampGenerator {
    generateTimestamp = jest.fn().mockImplementation((withTime) => {
      if (!withTime) return 'mocked-timestamp';
      return 'extended-timestamp';
    });
    generateRangeTimestamp = jest.fn().mockImplementation((withTime) => {
      if (!withTime) return 'mocked-range-timestamp';
      return 'extended-range-timestamp';
    });
  },
}));

const defaultBackupPath = 'backup';

describe('PathGenerator - Initialization and Default Paths', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('should initialize with default backup directory when no options provided', () => {
    const options: BackupOptions = {};
    const pathGenerator = new PathGenerator(options);

    const paths = pathGenerator.getPaths();

    expect(paths.parentDirectory).toBe(defaultBackupPath);
    expect(paths.backupDirectory).toBe(`${defaultBackupPath}\\mocked-timestamp`);
    expect(paths.backupPath).toBe(`${defaultBackupPath}\\mocked-timestamp\\extended-timestamp`);
    expect(paths.oldBackupDirectory).toBe('');
    expect(paths.oldBackupPath).toBe('');
  });

  it('should initialize with custom out path', () => {
    const options: BackupOptions = { out: 'custom-out-directory' };
    const pathGenerator = new PathGenerator(options);

    const paths = pathGenerator.getPaths();

    expect(paths.parentDirectory).toBe('custom-out-directory');
    expect(paths.backupDirectory).toBe('custom-out-directory\\mocked-timestamp');
    expect(paths.backupPath).toBe('custom-out-directory\\mocked-timestamp\\extended-timestamp');
    expect(paths.oldBackupDirectory).toBe('');
    expect(paths.oldBackupPath).toBe('');
  });

  it('should initialize with custom archive path', () => {
    const options: BackupOptions = { archive: 'custom-archive-directory' };
    const pathGenerator = new PathGenerator(options);

    const paths = pathGenerator.getPaths();

    expect(paths.parentDirectory).toBe('custom-archive-directory');
    expect(paths.backupDirectory).toBe('custom-archive-directory\\mocked-timestamp');
    expect(paths.backupPath).toBe('custom-archive-directory\\mocked-timestamp\\extended-timestamp');
    expect(paths.oldBackupDirectory).toBe('');
    expect(paths.oldBackupPath).toBe('');
  });

  it('should generate old backup paths using timestamp generator', () => {
    const options: BackupOptions = { removeOldBackups: true };
    const pathGenerator = new PathGenerator(options);

    const paths = pathGenerator.getPaths();

    expect(paths.oldBackupDirectory).toBe(`${defaultBackupPath}\\mocked-range-timestamp`);
    expect(paths.oldBackupPath).toBe(
      `${defaultBackupPath}\\mocked-range-timestamp\\extended-range-timestamp`
    );
  });

  it('should use custom old backup paths', () => {
    const options: BackupOptions = {
      removeOldBackups: true,
      oldBackupPath: 'custom-old-backup-path',
    };
    const pathGenerator = new PathGenerator(options);

    const paths = pathGenerator.getPaths();

    expect(paths.oldBackupDirectory).toBe('custom-old-backup-path');
    expect(paths.oldBackupPath).toBe('custom-old-backup-path');
  });

  it('should throw an error if parentPath is missing in createPath', () => {
    const options: BackupOptions = { out: ' ' };
    expect(() => new PathGenerator(options)).toThrowError();
  });

  it('should log an error if directory creation fails', () => {
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      throw new Error('Failed to create directory');
    });

    const options: BackupOptions = { out: 'custom-out-directory' };

    expect(() => new PathGenerator(options)).toThrowError('Failed to create directory');
    expect(BackupLogger.log).nthCalledWith(
      3,
      logConfig.types.error,
      'Error creating directory: custom-out-directory'
    );
  });

  it('should generate old backup paths using timestamp generator', () => {
    const options: BackupOptions = { removeOldBackups: true };
    const pathGenerator = new PathGenerator(options);

    const paths = pathGenerator.getPaths();

    expect(paths.oldBackupDirectory).toBe(`${defaultBackupPath}\\mocked-range-timestamp`);
    expect(paths.oldBackupPath).toBe(
      `${defaultBackupPath}\\mocked-range-timestamp\\extended-range-timestamp`
    );
  });

  it('should use custom old backup paths', () => {
    const customOldBackupPath = 'custom-old-backup-path';
    const options: BackupOptions = { removeOldBackups: true, oldBackupPath: customOldBackupPath };
    const pathGenerator = new PathGenerator(options);

    const paths = pathGenerator.getPaths();

    expect(paths.oldBackupDirectory).toBe(customOldBackupPath);
    expect(paths.oldBackupPath).toBe(customOldBackupPath);
  });
});
