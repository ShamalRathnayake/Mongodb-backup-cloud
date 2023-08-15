/* eslint-disable */
// @ts-nocheck

import TimestampGenerator from '../timestampGenerator';
import deleteConfig from '../../../backup/config/deleteConfig';

describe('TimestampGenerator', () => {
  let timestampGenerator;

  beforeEach(() => {
    timestampGenerator = new TimestampGenerator();
  });

  test('generateTimestamp() should return the correct date without time', () => {
    const result = timestampGenerator.generateTimestamp(false);
    const currentDate = new Date();
    const expected = `${currentDate.getFullYear()}_${
      currentDate.getMonth() + 1
    }_${currentDate.getDate()}`;
    expect(result).toBe(expected);
  });

  test('generateTimestamp() should return the correct date with time', () => {
    const result = timestampGenerator.generateTimestamp(true);
    const currentDate = new Date();
    const expected = `${`0${currentDate.getHours()}`.slice(
      -2
    )}H_${`0${currentDate.getMinutes()}`.slice(-2)}M_${`0${currentDate.getSeconds()}`.slice(-2)}S`;
    expect(result).toBe(expected);
  });

  test('generateRangeTimestamp() should return the correct date without time', () => {
    const result = timestampGenerator.generateRangeTimestamp(false);
    const currentDate = new Date();
    const previousBackupDate = new Date(currentDate);
    previousBackupDate.setDate(
      previousBackupDate.getDate() - deleteConfig.localBackupRange.default
    );
    const expected = `${previousBackupDate.getFullYear()}_${
      previousBackupDate.getMonth() + 1
    }_${previousBackupDate.getDate()}`;
    expect(result).toBe(expected);
  });

  test('generateRangeTimestamp() should return the correct date with time', () => {
    const result = timestampGenerator.generateRangeTimestamp(true);
    const currentDate = new Date();
    const previousBackupDate = new Date(currentDate);
    previousBackupDate.setDate(
      previousBackupDate.getDate() - deleteConfig.localBackupRange.default
    );
    const expected = `${`0${previousBackupDate.getHours()}`.slice(
      -2
    )}H_${`0${previousBackupDate.getMinutes()}`.slice(
      -2
    )}M_${`0${previousBackupDate.getSeconds()}`.slice(-2)}S`;
    expect(result).toBe(expected);
  });
});
