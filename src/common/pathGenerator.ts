import config from '../backup/config/config';
import { BackupOptions } from '../types/types';
import * as fs from 'fs';
import { BackupLogger } from './logger';
import logConfig from '../backup/config/logConfig';
import TimestampGenerator from './timestampGenerator';
import { join } from 'path';

export default class PathGenerator {
  private static backupPath: string = '';
  private constructor() {}

  public static generatePaths(options: BackupOptions) {
    BackupLogger.log(logConfig.types.debug, `Generating paths`);
    if (!options.out && !options.archive) {
      this.backupPath = this.dirCheck(config.defaultBackupPath);
      BackupLogger.log(
        logConfig.types.debug,
        `Using default backup path - "${config.defaultBackupPath}"`
      );
    } else if (options.out) {
      this.backupPath = this.dirCheck(join(options.out, TimestampGenerator.generateTimestamp()));
    } else if (options.archive) {
      this.backupPath = this.dirCheck(
        join(options.archive, TimestampGenerator.generateTimestamp())
      );
    }
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
