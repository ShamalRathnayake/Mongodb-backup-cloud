import { lstatSync } from 'fs';
import { BackupOptions, PathOptions } from '../../../types/types';
import backupConfig from '../../config/backupConfig';
import deleteConfig from '../../config/deleteConfig';
import directoryConfig from '../../config/directoryConfig';
import typeConfig from '../../config/typeConfig';
import { BackupLogger } from '../../../common/Logger/logger';
import logConfig from '../../config/logConfig';

export default class CommandGenerator {
  private optionString: string = 'mongodump ';
  private deleteCommand: string = '';

  constructor(options: BackupOptions, pathOptions: PathOptions) {
    BackupLogger.log(logConfig.types.debug, 'Starting command generation');
    for (const [key, value] of Object.entries(options)) {
      if (backupConfig.hasOwnProperty(key)) {
        switch (backupConfig[key].type) {
          case typeConfig.types.string:
            this.optionString += this.prepareStringOption(
              backupConfig[key].option,
              value as string
            );
            break;
          case typeConfig.types.boolean:
            this.optionString += this.prepareBooleanOption(
              backupConfig[key].option,
              value as boolean
            );
            break;
          case typeConfig.types.number:
            this.optionString += this.prepareNumberOption(
              backupConfig[key].option,
              value as number,
              key === 'verbose' ? (value as number) : 0
            );
            break;
          case typeConfig.types.array:
            this.optionString += this.prepareStringArrayOption(
              backupConfig[key].option,
              value as Array<string>
            );
            break;
        }
      } else if (directoryConfig.hasOwnProperty(key)) {
        switch (directoryConfig[key].key) {
          case directoryConfig.out.key:
            this.optionString += ` ${directoryConfig.out.option}=${pathOptions.backupPath}`;
            break;

          case directoryConfig.archive.key:
            this.optionString += ` ${directoryConfig.archive.option}=${pathOptions.backupPath}.${options.archiveExtension}`;
            break;
        }
      } else if (deleteConfig.hasOwnProperty(key)) {
        if (key === deleteConfig.removeOldBackups.key && value === true) {
          if (!options.oldBackupPath) {
            this.deleteCommand = this.prepareDeleteCommand(
              options.removeOldDir ? pathOptions.oldBackupDirectory : pathOptions.oldBackupPath
            );
          } else {
            this.deleteCommand = this.prepareDeleteCommand(options.oldBackupPath);
          }
        }
      }
    }
    BackupLogger.log(logConfig.types.debug, 'Command generation complete');
  }

  public getCommand(): string {
    return this.optionString;
  }

  public getDeleteCommand(): string {
    return this.deleteCommand;
  }

  private prepareStringOption(key: string, value: string): string {
    return ` ${key}=${value}`;
  }

  private prepareNumberOption(key: string, value: number, repeatValue?: number): string {
    if (repeatValue && repeatValue > 0) return ` -${key.repeat(repeatValue)}`;
    return ` ${key}=${value}`;
  }

  private prepareBooleanOption(key: string, value: boolean): string {
    if (!value) return '';
    return ` ${key}`;
  }

  private prepareStringArrayOption(key: string, values: Array<string>): string {
    let arrayString = '';
    for (const value of values) {
      arrayString += ` ${key}=${value}`;
    }
    return arrayString;
  }

  private prepareDeleteCommand(path: string): string {
    let isDir;
    try {
      isDir = lstatSync(path).isDirectory();
    } catch (error) {
      BackupLogger.log(
        logConfig.types.error,
        error instanceof Error ? error.message : (error as string)
      );
      isDir = true;
    }

    if (isDir) {
      return process.platform === 'win32'
        ? `rmdir /Q /S ${path.replace(/\//g, '\\')}`
        : `rm -rf ${path}`;
    } else {
      return process.platform === 'win32' ? `del /f ${path.replace(/\//g, '\\')}` : `rm -f ${path}`;
    }
  }
}
