/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
import * as cron from 'node-cron';

import {
  InvalidOptionError,
  InvalidValueForOptionError,
  OptionRequiredError,
  OptionRequiredToUseError,
} from '../../../common/errorHandler/errorHandler';
import { BackupLogger } from '../../../common/Logger/logger';
import { BackupOptions } from '../../../types/types';
import backupConfig from '../../config/backupConfig';
import deleteConfig from '../../config/deleteConfig';
import directoryConfig from '../../config/directoryConfig';
import logConfig from '../../config/logConfig';
import scheduleConfig from '../../config/scheduleConfig';
import typeConfig from '../../config/typeConfig';

export default class OptionsValidator {
  // eslint-disable-next-line no-use-before-define
  private static instance: OptionsValidator;

  private constructor() {}

  public static validate(options: BackupOptions): void {
    if (!OptionsValidator.instance) {
      OptionsValidator.instance = new OptionsValidator();
    }

    OptionsValidator.instance.validateOptions(options);
  }

  private validateOptions(options: BackupOptions): void {
    BackupLogger.log(logConfig.types.debug, 'Starting options validation');
    if (!options.config?.trim() && (!options.host || options.host === ''))
      throw new OptionRequiredError('host');
    if (!options.config?.trim() && (!options.port || Number.isNaN(options.port)))
      throw new OptionRequiredError('port');
    if (options.query && !options.collection)
      throw new OptionRequiredToUseError('collection', 'query');
    if (
      options.verbose &&
      (Number.isNaN(options.verbose) || options.verbose > 5 || options.verbose < 1)
    ) {
      throw new InvalidValueForOptionError(
        'verbose',
        'verbose option can only be a value between 1 and 5'
      );
    }
    if (options.out && options.archive) {
      throw new Error('both out and archive options cannot be used at once');
    }
    if (options.archive && (!options.archiveExtension || !options.archiveExtension.trim())) {
      throw new OptionRequiredToUseError('archiveExtension', 'archive');
    }

    if (
      options.config?.trim() &&
      (options.host || options.port || options.password || options.sslPEMKeyPassword)
    )
      throw new Error(
        '`host` , `port` , `password` and `sslPEMKeyPassword` options are not required when using `config` option'
      );

    for (const [key, value] of Object.entries(options)) {
      const configObject = this.getConfigObject(key);

      if (configObject) {
        switch (configObject[key].type) {
          case typeConfig.types.array:
            this.validateArrayOption(value, key);
            break;
          default:
            this.validateOption(value, key, configObject[key].type);
            break;
        }
      } else {
        throw new InvalidOptionError(key);
      }
    }

    BackupLogger.log(logConfig.types.debug, 'Options validation complete');
  }

  private getConfigObject(key: string): Record<string, Record<string, unknown>> | null {
    if (backupConfig.hasOwnProperty(key)) {
      return backupConfig;
    }
    if (directoryConfig.hasOwnProperty(key)) {
      return directoryConfig;
    }
    if (scheduleConfig.hasOwnProperty(key)) {
      return scheduleConfig;
    }
    if (deleteConfig.hasOwnProperty(key)) {
      return deleteConfig;
    }
    return null;
  }

  private validateOption(optionValue: unknown, optionName: string, optionType: any): void {
    if (
      typeof optionValue !== optionType ||
      (optionType === typeConfig.types.string &&
        optionName === scheduleConfig.schedule.key &&
        !cron.validate(optionValue as string)) ||
      (optionType === typeConfig.types.string && (optionValue as any).trim() === '') ||
      (optionType === typeConfig.types.number && Number.isNaN(optionValue as any))
    )
      throw new InvalidValueForOptionError(optionName, optionValue);
  }

  private validateArrayOption(option: unknown, optionName: string): void {
    if (typeof option !== 'object' || !Array.isArray(option)) {
      throw new InvalidValueForOptionError(optionName, option);
    }
    for (const item of option) {
      if (typeof item !== 'string') throw new InvalidValueForOptionError(optionName, option);
    }
  }
}
