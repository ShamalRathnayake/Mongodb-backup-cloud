import OptionsValidator from './helpers/optionsValidator/optionsValidator';
import { BackupOptions, PathOptions } from '../types/types';
import CommandGenerator from './helpers/commandGenerator/commandGenerator';
import logConfig from './config/logConfig';
import { BackupLogger } from '../common/Logger/logger';
import PathGenerator from '../common/pathGenerator/pathGenerator';
import CommandExecutor from './helpers/commandExecutor/commandExecutor';

export default class Backup {
  private backupCommand: string;
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

      this.backupCommand = commandGenerator.getBackupCommand();
      console.log(
        '🚀 ~ file: backup.ts:27 ~ Backup ~ constructor ~ this.command:',
        this.backupCommand
      );

      this.deleteCommand = commandGenerator.getDeleteCommand();
      console.log(
        '🚀 ~ file: backup.ts:32 ~ Backup ~ constructor ~ this.deleteCommand :',
        this.deleteCommand
      );

      this.executeCommands();
    } catch (error: any) {
      BackupLogger.log(logConfig.types.error, error.message);
      throw error;
    }
  }

  public print() {
    return this.backupCommand;
  }

  private async executeCommands(): Promise<void> {
    const backupStatus = await CommandExecutor.executeCommand(this.backupCommand);
    console.log('🚀 ~ file: backup.ts:42 ~ Backup ~ constructor ~ backupStatus:', backupStatus);

    const deleteStatus = await CommandExecutor.executeCommand(this.deleteCommand);
    console.log('🚀 ~ file: backup.ts:46 ~ Backup ~ constructor ~ deleteStatus:', deleteStatus);
  }
}

//TODO change process to backup from schedule
