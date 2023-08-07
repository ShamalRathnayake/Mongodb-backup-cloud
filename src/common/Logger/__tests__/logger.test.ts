/* eslint-disable */
// @ts-nocheck

import { BackupLogger, UploadLogger } from '../logger';
import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    align: jest.fn(),
  },
}));

jest.mock('winston-daily-rotate-file', () => jest.fn());

describe('BackupLogger', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle logging and log via static methods', () => {
    BackupLogger.toggleLogging(true);

    const mockLoggerInstance = createLogger.mock.results[0].value;
    expect(mockLoggerInstance).toBeDefined();

    BackupLogger.log('info', 'Test message');
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', 'Test message');
  });
});

describe('UploadLogger', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle logging and log via static methods', () => {
    UploadLogger.toggleLogging(true);

    const mockLoggerInstance = createLogger.mock.results[0].value;
    expect(mockLoggerInstance).toBeDefined();

    UploadLogger.log('info', 'Test message');
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', 'Test message');
  });
});
