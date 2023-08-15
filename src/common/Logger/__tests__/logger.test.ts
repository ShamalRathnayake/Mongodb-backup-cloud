/* eslint-disable */
// @ts-nocheck

import { BackupLogger, UploadLogger } from '../logger';

describe('BackupLogger', () => {
  it('should toggle logging status', () => {
    BackupLogger.toggleLogging(true);
    expect(BackupLogger.instance.isLoggingEnabled).toBe(true);

    BackupLogger.toggleLogging(false);
    expect(BackupLogger.instance.isLoggingEnabled).toBe(false);
  });

  it('should log when logging is enabled', () => {
    BackupLogger.toggleLogging(true);
    const spy = jest.spyOn(BackupLogger.instance, 'log');
    BackupLogger.log('info', 'Test message');
    expect(spy).toHaveBeenCalledWith('info', 'Test message');
    spy.mockRestore();
  });

  it('should create a singleton instance', () => {
    const logger1 = BackupLogger.instance;
    const logger2 = BackupLogger.instance;

    expect(logger1 === logger2).toBe(true);
  });
});

describe('UploadLogger', () => {
  it('should toggle logging status', () => {
    UploadLogger.toggleLogging(true);
    expect(UploadLogger.instance.isLoggingEnabled).toBe(true);

    UploadLogger.toggleLogging(false);
    expect(UploadLogger.instance.isLoggingEnabled).toBe(false);
  });

  it('should log when logging is enabled', () => {
    UploadLogger.toggleLogging(true);
    const spy = jest.spyOn(UploadLogger.instance, 'log');
    UploadLogger.log('info', 'Test message');
    expect(spy).toHaveBeenCalledWith('info', 'Test message');
    spy.mockRestore();
  });

  it('should create a singleton instance', () => {
    const logger1 = UploadLogger.instance;
    const logger2 = UploadLogger.instance;

    expect(logger1 === logger2).toBe(true);
  });
});
