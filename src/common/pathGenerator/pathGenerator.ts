import * as fs from 'fs';
import { join } from 'path';

import config from '../../backup/config/config';
import logConfig from '../../backup/config/logConfig';
import { BackupOptions, PathOptions } from '../../types/types';
import { BackupLogger } from '../Logger/logger';
import TimestampGenerator from '../timestampGenerator/timestampGenerator';

export default class PathGenerator {
  private parentDirectory: string = '';

  private backupPath: string = '';

  private backupDirectory: string = '';

  private oldBackupPath: string = '';

  private oldBackupDirectory: string = '';

  private timestampGenerator = new TimestampGenerator();

  constructor(options: BackupOptions) {
    BackupLogger.log(logConfig.types.debug, 'Starting path generation');

    if (!options.out && !options.archive) {
      BackupLogger.log(
        logConfig.types.debug,
        `Using default backup directory - "${config.defaultBackupPath}"`
      );

      this.parentDirectory = this.createPath(config.defaultBackupPath, false, false);
    } else if (options.out) {
      BackupLogger.log(logConfig.types.debug, `Using "${options.out}" as backup directory `);

      this.parentDirectory = this.createPath(options.out, false, false);
    } else if (options.archive) {
      BackupLogger.log(logConfig.types.debug, `Using "${options.archive}" as backup directory `);

      this.parentDirectory = this.createPath(options.archive, false, false);
    }

    this.backupDirectory = this.createPath(this.parentDirectory, true, false);

    this.backupPath = this.createPath(this.parentDirectory, true, true);

    if (options.removeOldBackups) {
      if (!options.oldBackupPath || !options.oldBackupPath.trim()) {
        this.oldBackupDirectory = join(
          this.parentDirectory,
          this.timestampGenerator
            .generateRangeTimestamp(false, options.localBackupRange || undefined)
            .trim()
        );

        this.oldBackupPath = join(
          this.oldBackupDirectory,
          this.timestampGenerator
            .generateRangeTimestamp(true, options.localBackupRange || undefined)
            .trim()
        );
      } else {
        this.oldBackupDirectory = options.oldBackupPath;
        this.oldBackupPath = options.oldBackupPath;
      }
    }

    BackupLogger.log(logConfig.types.debug, 'Path generation complete');
  }

  public getPaths(): PathOptions {
    return {
      parentDirectory: this.parentDirectory,
      backupDirectory: this.backupDirectory,
      backupPath: this.backupPath,
      oldBackupDirectory: this.oldBackupDirectory,
      oldBackupPath: this.oldBackupPath,
    };
  }

  private dirCheck(path: string): string {
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {
          recursive: true,
        });
      }
    } catch (error) {
      BackupLogger.log(logConfig.types.error, `Error creating directory: ${path}`);
      throw error;
    }

    return path;
  }

  private createPath(parentPath: string, withDate: boolean, withTime: boolean): string {
    if (!parentPath || !parentPath.trim()) {
      BackupLogger.log(
        logConfig.types.error,
        'Invalid value for parentPath at createPath in PathGenerator'
      );
      throw new Error();
    }

    return this.dirCheck(
      join(
        parentPath,
        withDate ? this.timestampGenerator.generateTimestamp() : '',
        withTime ? this.timestampGenerator.generateTimestamp(true) : ''
      )
    ).trim();
  }
}
