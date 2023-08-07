import cron from 'node-cron';

import { BackupLogger } from '../common/Logger/logger';
import PathGenerator from '../common/pathGenerator/pathGenerator';
import { BackupOptions, PathOptions } from '../types/types';
import logConfig from './config/logConfig';
import CommandExecutor from './helpers/commandExecutor/commandExecutor';
import CommandGenerator from './helpers/commandGenerator/commandGenerator';
import OptionsValidator from './helpers/optionsValidator/optionsValidator';

export default class Backup {
  private backupCommand: string = '';

  private deleteCommand: string = '';

  private paths: PathOptions = {
    parentDirectory: '',
    backupPath: '',
    backupDirectory: '',
    oldBackupPath: '',
    oldBackupDirectory: '',
  };

  private options: BackupOptions;

  constructor(options: BackupOptions, enableLogs: boolean = false) {
    if (enableLogs) BackupLogger.toggleLogging(true);

    try {
      OptionsValidator.validate(options);

      this.options = options;
    } catch (error: unknown) {
      let errorMsg: string = 'Unknown error occurred.';

      if (error instanceof Error) errorMsg = error.message;
      else if (typeof error === 'string') errorMsg = error;

      BackupLogger.log(logConfig.types.error, errorMsg);
      throw error;
    }
  }

  private async executeCommands() {
    const backupStatus = await CommandExecutor.executeCommand(this.backupCommand);

    const deleteStatus = await CommandExecutor.executeCommand(this.deleteCommand);

    return { backupStatus, deleteStatus };
  }

  private async prepareBackupProcess(options: BackupOptions) {
    const pathGenerator = new PathGenerator(options);

    this.paths = pathGenerator.getPaths();

    const commandGenerator = new CommandGenerator(options, this.paths);

    this.backupCommand = commandGenerator.getBackupCommand();
    this.deleteCommand = commandGenerator.getDeleteCommand();
  }

  public async handleBackupProcess() {
    BackupLogger.log(logConfig.types.debug, 'Backup process started');
    if (this.options.schedule) {
      cron.schedule(this.options.schedule, async () => {
        await this.prepareBackupProcess(this.options);
        const { backupStatus, deleteStatus } = await this.executeCommands();

        const returnObject = {
          paths: this.paths,
          backupStatus,
          deleteStatus,
        };
        BackupLogger.log(logConfig.types.debug, 'Backup process finished');
        if (this.options.scheduleCallback) return this.options.scheduleCallback(returnObject);
        return returnObject;
      });
    }
    await this.prepareBackupProcess(this.options);
    const { backupStatus, deleteStatus } = await this.executeCommands();
    BackupLogger.log(logConfig.types.debug, 'Backup process finished');
    return {
      paths: this.paths,
      backupStatus,
      deleteStatus,
    };
  }
}
