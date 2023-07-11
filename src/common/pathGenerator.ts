import config from '../backup/config/config';
import { BackupOptions } from '../types/types';
import * as fs from 'fs';
import { BackupLogger } from './logger';
import logConfig from '../backup/config/logConfig';
import TimestampGenerator from './timestampGenerator';
import { join } from 'path';

export default class PathGenerator {
  private static backupPath: string = '';
  private static backupDirectory: string = '';
  private static oldBackupPath: string = '';
  private static oldBackupDirectory: string = '';
  private constructor() {}

  public static generatePaths(options: BackupOptions): {
    backupPath: string;
    backupDirectory: string;
    oldBackupPath: string;
    oldBackupDirectory: string;
  } {
    BackupLogger.log(logConfig.types.debug, `Generating paths`);
    if (!options.out && !options.archive) {
      this.backupPath = this.dirCheck(
        join(config.defaultBackupPath, TimestampGenerator.generateTimestamp())
      ).trim();
      this.backupDirectory = this.dirCheck(config.defaultBackupPath).trim();
      BackupLogger.log(
        logConfig.types.debug,
        `Using default backup directory - "${config.defaultBackupPath}"`
      );
    } else if (options.out) {
      this.backupPath = this.dirCheck(
        join(options.out, TimestampGenerator.generateTimestamp())
      ).trim();
      this.backupDirectory = this.dirCheck(options.out).trim();
    } else if (options.archive) {
      this.backupPath = this.dirCheck(
        join(options.archive, TimestampGenerator.generateTimestamp())
      ).trim();
      this.backupDirectory = this.dirCheck(options.archive).trim();
    }

    if (options.removeOldBackups) {
      this.oldBackupDirectory = join(
        this.backupDirectory,
        TimestampGenerator.generateRangeTimestamp(
          false,
          false,
          options.localBackupRange || undefined
        ).trim()
      );

      this.oldBackupPath = `${this.oldBackupDirectory}/${TimestampGenerator.generateRangeTimestamp(
        true,
        false,
        options.localBackupRange || undefined
      )}`.trim();
    }

    return {
      backupPath: this.backupPath,
      backupDirectory: this.backupDirectory,
      oldBackupPath: this.oldBackupPath,
      oldBackupDirectory: this.oldBackupDirectory,
    };
  }

  private static dirCheck(path: string): string {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {
        recursive: true,
      });
    }

    return path;
  }
}
