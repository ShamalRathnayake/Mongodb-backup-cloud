import OptionsValidator from './helpers/optionsValidator';
import { BackupOptions } from '../types/types';
import CommandGenerator from './helpers/commandGenerator';
import logConfig from './config/logConfig';
import { BackupLogger } from '../common/logger';
import PathGenerator from '../common/pathGenerator';

export default class Backup {
  private command: string;
  private paths: Record<string, any>;

  constructor(options: BackupOptions, enableLogs: boolean = false) {
    if (enableLogs) BackupLogger.toggleLogging(true);

    try {
      BackupLogger.log(logConfig.types.debug, 'Backup process started');

      OptionsValidator.validate(options);

      this.paths = PathGenerator.generatePaths(options);

      this.command = CommandGenerator.generate(options);
    } catch (error: any) {
      BackupLogger.log(logConfig.types.error, error.message);
      throw error;
    }
  }

  public print() {
    return this.command;
  }
}
