import { exec } from 'child_process';
import { promisify } from 'util';
import { BackupLogger } from '../../../common/Logger/logger';
import logConfig from '../../config/logConfig';

const execAsync = promisify(exec);
export default class CommandExecutor {
  private constructor() {}

  public static async executeCommand(command: string): Promise<{
    status: boolean;
    log: any;
  }> {
    try {
      BackupLogger.log(logConfig.types.debug, 'Command execution started');
      const { stdout, stderr } = await execAsync(command);

      if (stderr) BackupLogger.log(logConfig.types.error, stderr);

      BackupLogger.log(logConfig.types.debug, 'Command execution finished');

      return {
        status: true,
        log: stderr || stdout,
      };
    } catch (error: any) {
      BackupLogger.log(logConfig.types.error, error.message);
      return {
        status: false,
        log: error.message,
      };
    }
  }
}
