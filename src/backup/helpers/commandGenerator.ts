import { BackupOptions } from '../../types/types';
import backupConfig from '../config/backupConfig';

export default class CommandGenerator {
  private optionString: string = 'mongodump ';
  private static instance: CommandGenerator;

  private constructor() {}

  public static generate(options: BackupOptions): string {
    if (!CommandGenerator.instance) {
      CommandGenerator.instance = new CommandGenerator();
    }

    return CommandGenerator.instance.generateCommand(options);
  }

  private generateCommand(options: BackupOptions): string {
    for (const [key, value] of Object.entries(options)) {
      if (backupConfig.hasOwnProperty(key)) {
        switch (backupConfig[key].type) {
          case String:
            this.optionString += this.prepareStringOption(
              backupConfig[key].option,
              value as string
            );
            break;
          case Boolean:
            this.optionString += this.prepareBooleanOption(
              backupConfig[key].option,
              value as boolean
            );
            break;
          case Number:
            this.optionString += this.prepareNumberOption(
              backupConfig[key].option,
              value as number,
              key === 'verbose' ? (value as number) : 0
            );
            break;
          case Array:
            this.optionString += this.prepareStringArrayOption(
              backupConfig[key].option,
              value as Array<string>
            );
            break;
        }
      } else {
        throw new Error(`Invalid option: ${key}`);
      }
    }

    return this.optionString;
  }

  private prepareStringOption(key: string, value: string): string {
    return ` ${key}=${value}`;
  }

  private prepareNumberOption(key: string, value: number, repeatValue?: number): string {
    if (repeatValue && repeatValue > 0) return ` -${key.repeat(repeatValue)}`;
    return ` ${key}=${value}`;
  }

  private prepareBooleanOption(key: string, value: boolean): string {
    if (!value) return '';
    return ` ${key}`;
  }

  private prepareStringArrayOption(key: string, values: Array<string>): string {
    let arrayString = '';
    for (const value of values) {
      arrayString += ` ${key}=${value}`;
    }
    return arrayString;
  }
}
