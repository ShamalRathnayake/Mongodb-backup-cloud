import { exec } from 'child_process';
import { promisify } from 'util';

import { BackupLogger } from '../../../common/Logger/logger';
import logConfig from '../../config/logConfig';

const execAsync = promisify(exec) as (
  // eslint-disable-next-line no-unused-vars
  command: string
) => Promise<{ stdout: string; stderr: string }>;

export default class CommandExecutor {
  private constructor() {}

  // Execute the specified command asynchronously and return the result.
  public static async executeCommand(command: string): Promise<{
    readonly status: boolean;
    readonly log: string;
  }> {
    try {
      BackupLogger.log(logConfig.types.debug, 'Command execution started');

      // Execute the command and capture the stdout and stderr
      const { stdout, stderr } = await execAsync(command);

      BackupLogger.log(logConfig.types.debug, 'Command execution finished');

      // Return the result as a status and log object
      return {
        status: true,
        log: stderr || stdout,
      };
    } catch (error: unknown) {
      let errorMsg: string = 'Unknown error occurred.';

      if (error instanceof Error) errorMsg = error.message;
      else if (typeof error === 'string') errorMsg = error;

      // Log and return the error if the command execution fails
      BackupLogger.log(logConfig.types.error, errorMsg);
      return {
        status: false,
        log: errorMsg,
      };
    }
  }
}
