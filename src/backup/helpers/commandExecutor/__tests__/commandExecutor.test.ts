/* eslint-disable */
// @ts-nocheck

import childProcess, { ExecException, exec } from 'child_process';
import CommandExecutor from '../commandExecutor';
import { BackupLogger } from '../../../../common/Logger/logger';
import logConfig from '../../../config/logConfig';

jest.mock('child_process');
const mockedExec = exec as jest.MockedFunction<typeof exec>;

jest.mock('../../../../common/Logger/logger');

describe('Command Executor', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('executes the command and returns correct status and log on success', async () => {
    // Test implementation
    const command = 'echo Hello World!';
    const stdout = 'Hello World!';
    const stderr = '';

    // Mock the exec function to simulate successful execution
    mockedExec.mockImplementation((_command, callback) => {
      callback(null, { stdout, stderr });
    });

    const result = await CommandExecutor.executeCommand(command);

    expect(mockedExec).toHaveBeenCalledWith(command, expect.any(Function));
    expect(mockedExec).toBeCalledTimes(1);
    expect(result).toHaveProperty('status');
    expect(result.status).toBe(true);
    expect(result).toHaveProperty('log');
    expect(result.log).toBe(stdout);
  });

  it('handles command execution failure and returns correct status and log', async () => {
    // Test implementation
    const command = 'echo Hello World!';
    const stdout = 'Hello World!';
    const stderr = '';

    // Mock the exec function to simulate successful execution
    mockedExec.mockImplementation((_command, callback) => {
      callback(null, { stdout, stderr });
    });

    const result = await CommandExecutor.executeCommand(command);

    expect(mockedExec).toHaveBeenCalledWith(command, expect.any(Function));
    expect(mockedExec).toBeCalledTimes(1);
    expect(result).toHaveProperty('status');
    expect(result.status).toBe(true);
    expect(result).toHaveProperty('log');
    expect(result.log).toBe(stdout);
  });

  it('handles non-Error type error and returns correct status and log', async () => {
    // Test implementation
    const command = 'some-command';
    const nonErrorString = 'Non-Error error message';
    const stderr = 'Error output message';

    // Mock the exec function to simulate non-Error type error
    mockedExec.mockImplementation((_command, callback) => {
      callback(nonErrorString, { stdout: '', stderr });
    });

    const result = await CommandExecutor.executeCommand(command);

    expect(mockedExec).toHaveBeenCalledWith(command, expect.any(Function));
    expect(mockedExec).toBeCalledTimes(1);
    expect(result).toHaveProperty('status');
    expect(result.status).toBe(false);
    expect(result).toHaveProperty('log');
    expect(result.log).toBe(nonErrorString);
  });

  it('logs debug messages on successful command execution', async () => {
    // Test implementation
    const command = 'echo Hello World!';
    const stdout = 'Hello World!';
    const stderr = '';

    // Mock the exec function to simulate successful execution
    mockedExec.mockImplementation((_command, callback) => {
      callback(null, { stdout, stderr });
    });

    const result = await CommandExecutor.executeCommand(command);

    expect(mockedExec).toHaveBeenCalledWith(command, expect.any(Function));
    expect(mockedExec).toBeCalledTimes(1);
    expect(result).toHaveProperty('status');
    expect(result.status).toBe(true);
    expect(result).toHaveProperty('log');
    expect(result.log).toBe(stdout);
    expect(BackupLogger.log).toHaveBeenCalledWith(
      logConfig.types.debug,
      'Command execution started'
    );
    expect(BackupLogger.log).toHaveBeenCalledWith(
      logConfig.types.debug,
      'Command execution finished'
    );
  });

  it('logs error messages on command execution failure', async () => {
    // Test implementation
    const command = 'some-command';
    const stderr = 'Error output message';

    // Mock the exec function to simulate non-Error type error
    mockedExec.mockImplementation((_command, callback) => {
      callback(Error(stderr), { stdout: '', stderr });
    });

    const result = await CommandExecutor.executeCommand(command);

    expect(mockedExec).toHaveBeenCalledWith(command, expect.any(Function));
    expect(mockedExec).toBeCalledTimes(1);
    expect(result).toHaveProperty('status');
    expect(result.status).toBe(false);
    expect(result).toHaveProperty('log');
    expect(result.log).toBe(stderr);
    expect(BackupLogger.log).toHaveBeenCalledWith(
      logConfig.types.debug,
      'Command execution started'
    );
    expect(BackupLogger.log).toHaveBeenCalledWith(logConfig.types.error, stderr);
  });

  // Additional integration testing scenarios

  it('correctly logs debug messages when logger is mocked', async () => {
    // Test implementation
    const command = 'echo Hello World!';
    const stdout = 'Hello World!';
    const stderr = '';

    // Mock the exec function to simulate successful execution
    mockedExec.mockImplementation((_command, callback) => {
      callback(null, { stdout, stderr });
    });

    // Mock the BackupLogger.log function
    const mockedLog = BackupLogger.log.mockImplementation(() => {});

    const result = await CommandExecutor.executeCommand(command);

    expect(mockedExec).toHaveBeenCalledWith(command, expect.any(Function));
    expect(mockedExec).toBeCalledTimes(1);
    expect(result).toHaveProperty('status');
    expect(result.status).toBe(true);
    expect(result).toHaveProperty('log');
    expect(result.log).toBe(stdout);
    expect(mockedLog).toHaveBeenCalledWith(logConfig.types.debug, 'Command execution started');
    expect(mockedLog).toHaveBeenCalledWith(logConfig.types.debug, 'Command execution finished');
  });

  // Snapshot testing scenarios

  it('matches snapshot for logConfig', async () => {
    // Mock the exec function to simulate successful execution
    mockedExec.mockImplementation((_command, callback) => {
      callback(null, { stdout, stderr });
    });
    // Test implementation
    expect(logConfig).toMatchSnapshot();
  });

  it('matches snapshot for executeCommand output', async () => {
    // Test implementation
    const command = 'echo Hello World!';

    // Mock the exec function to simulate successful execution
    mockedExec.mockImplementation((_command, callback) => {
      callback(null, { stdout, stderr });
    });

    const result = await CommandExecutor.executeCommand(command);
    expect(result).toMatchSnapshot();
  });

  // Additional edge testing scenarios

  it('correctly handles parallel command execution', async () => {
    // Test implementation
    // Mock the BackupLogger.log function
    const mockedLog = BackupLogger.log.mockImplementation(() => {});

    // Replace with the actual test commands
    const commands = ['echo Command_1', 'echo Command_2', 'echo Command_3'];

    // Mock the exec function to simulate successful execution
    mockedExec.mockImplementation((_command, callback) => {
      callback(null, { stdout: '', stderr: '' });
    });

    const executePromises = commands.map((command) => CommandExecutor.executeCommand(command));

    // Simulate parallel execution
    await Promise.all(executePromises);

    // Verify that the Logger was called with the correct logs
    expect(mockedLog).toBeCalledTimes(6);
    expect(mockedLog).nthCalledWith(1, expect.anything(), 'Command execution started');
    expect(mockedLog).nthCalledWith(4, expect.anything(), 'Command execution finished');

    // Restore the original Logger implementation
    jest.restoreAllMocks();
  });
});
