import OptionsValidator from './helpers/optionsValidator/optionsValidator';
import { BackupOptions, PathOptions } from '../types/types';
import CommandGenerator from './helpers/commandGenerator/commandGenerator';
import logConfig from './config/logConfig';
import { BackupLogger } from '../common/Logger/logger';
import PathGenerator from '../common/pathGenerator/pathGenerator';

export default class Backup {
  private command: string;
  private deleteCommand: string;
  private paths: PathOptions;

  constructor(options: BackupOptions, enableLogs: boolean = false) {
    if (enableLogs) BackupLogger.toggleLogging(true);

    try {
      BackupLogger.log(logConfig.types.debug, 'Backup process started');

      OptionsValidator.validate(options);

      const pathGenerator = new PathGenerator(options);

      this.paths = pathGenerator.getPaths();
      console.log('🚀 ~ file: backup.ts:26 ~ Backup ~ constructor ~ this.paths:', this.paths);

      const commandGenerator = new CommandGenerator(options, this.paths);

      this.command = commandGenerator.getCommand();
      console.log('🚀 ~ file: backup.ts:27 ~ Backup ~ constructor ~ this.command:', this.command);

      this.deleteCommand = commandGenerator.getDeleteCommand();
      console.log(
        '🚀 ~ file: backup.ts:32 ~ Backup ~ constructor ~ this.deleteCommand :',
        this.deleteCommand
      );
    } catch (error: any) {
      BackupLogger.log(logConfig.types.error, error.message);
      throw error;
    }
  }

  public print() {
    return this.command;
  }
}
