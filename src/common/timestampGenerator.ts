export default class TimestampGenerator {
  private static date = new Date();

  private constructor() {}

  public static generateTimestamp(withSeconds: boolean = false, newDate: boolean = false) {
    if (newDate) this.date = new Date();
    if (withSeconds) {
      return `${`0${new Date(this.date).getHours()}`.slice(-2)}H_${`0${new Date(
        this.date
      ).getMinutes()}`.slice(-2)}M_${`0${new Date(this.date).getSeconds()}`.slice(-2)}S`;
    } else {
      return `${new Date(this.date).getFullYear()}_${new Date(this.date).getMonth() + 1}_${new Date(
        this.date
      ).getDate()}`;
    }
  }
}
