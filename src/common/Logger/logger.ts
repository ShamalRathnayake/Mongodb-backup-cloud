/* eslint-disable max-classes-per-file */
import { createLogger, format, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import logConfig from '../../backup/config/logConfig';

abstract class BaseLogger {
  protected logger: Logger | null;

  protected isLoggingEnabled: boolean;

  protected constructor() {
    this.logger = null;
    this.isLoggingEnabled = true;
  }

  public toggleLogging(status: boolean): void {
    this.isLoggingEnabled = status;
    if (!status) {
      this.logger = null;
      return;
    }

    const transportOptions = {
      filename: this.getLogFileName(),
      dirname: this.getLogFilePath(),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      handleExceptions: true,
      exitOnError: false,
    };

    this.logger = createLogger({
      level: 'debug',
      transports: [new DailyRotateFile(transportOptions)],
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss A',
        }),
        format.printf(({ timestamp, level, message }) => {
          return `${'-'.repeat(
            100
          )}\n[${timestamp}] - [${this.getServiceName()}] - ${level}: ${message}`;
        }),
        format.colorize(),
        format.align()
      ),
    });
  }

  protected abstract getLogFileName(): string;

  protected abstract getLogFilePath(): string;

  protected abstract getServiceName(): string;

  public log(level: string, message: string): void {
    if (this.isLoggingEnabled && this.logger) {
      this.logger.log(level, message);
    }
  }
}

export class BackupLogger extends BaseLogger {
  // eslint-disable-next-line no-use-before-define
  private static instance: BackupLogger = new BackupLogger();

  private constructor() {
    super();
  }

  protected getLogFileName(): string {
    // eslint-disable-next-line quotes
    return `backup-%DATE%.log`;
  }

  protected getLogFilePath(): string {
    return logConfig.backupLogPath;
  }

  protected getServiceName(): string {
    return 'backup-service';
  }

  public static toggleLogging(status: boolean): void {
    BackupLogger.instance.toggleLogging(status);
  }

  public static log(level: string, message: string): void {
    BackupLogger.instance.log(level, message);
  }
}

export class UploadLogger extends BaseLogger {
  // eslint-disable-next-line no-use-before-define
  private static instance: UploadLogger = new UploadLogger();

  private constructor() {
    super();
  }

  protected getLogFileName(): string {
    // eslint-disable-next-line quotes
    return `upload-%DATE%.log`;
  }

  protected getLogFilePath(): string {
    return logConfig.uploadLogPath;
  }

  protected getServiceName(): string {
    return 'upload-service';
  }

  public static toggleLogging(status: boolean): void {
    UploadLogger.instance.toggleLogging(status);
  }

  public static log(level: string, message: string): void {
    UploadLogger.instance.log(level, message);
  }
}
