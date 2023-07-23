import deleteConfig from '../../backup/config/deleteConfig';

export default class TimestampGenerator {
  private static date = new Date();

  private constructor() {}

  public static generateTimestamp(time: boolean = false, newDate: boolean = false) {
    if (newDate) this.date = new Date();
    if (time) {
      return `${`0${new Date(this.date).getHours()}`.slice(-2)}H_${`0${new Date(
        this.date
      ).getMinutes()}`.slice(-2)}M_${`0${new Date(this.date).getSeconds()}`.slice(-2)}S`;
    } else {
      return `${new Date(this.date).getFullYear()}_${new Date(this.date).getMonth() + 1}_${new Date(
        this.date
      ).getDate()}`;
    }
  }

  public static generateRangeTimestamp(
    time: boolean = false,
    newDate: boolean = false,
    range: number = deleteConfig.localBackupRange.default
  ) {
    if (newDate) this.date = new Date();

    const date = new Date(this.date);
    const previousBackupDate = new Date(date.setDate(date.getDate() - range));

    if (time) {
      return `${`0${new Date(previousBackupDate).getHours()}`.slice(-2)}H_${`0${new Date(
        previousBackupDate
      ).getMinutes()}`.slice(-2)}M_${`0${new Date(previousBackupDate).getSeconds()}`.slice(-2)}S`;
    } else {
      return `${new Date(previousBackupDate).getFullYear()}_${
        new Date(previousBackupDate).getMonth() + 1
      }_${new Date(previousBackupDate).getDate()}`;
    }
  }
}
