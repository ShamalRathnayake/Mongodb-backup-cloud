import { DirectOptions, URIOptions } from '../types/types';
import { extendedOptionString, generateOptionString, handleBackupProcess } from './functions';

export default class Backup {
  static async withConnectionString(options: URIOptions) {
    if (!options.uri) throw new Error('Mongodb connection uri string is required');
    const commonOptions = generateOptionString(options);
    const cmd = `mongodump --uri=${options.uri.trim()} ${commonOptions}`;
    const output = await handleBackupProcess(options, cmd);

    return output;
  }

  static async withHostAndPort(options: DirectOptions) {
    const extendedOptions = extendedOptionString(options);
    const cmd = `mongodump ${extendedOptions}`;
    const output = await handleBackupProcess(options, cmd);
    return output;
  }
}
