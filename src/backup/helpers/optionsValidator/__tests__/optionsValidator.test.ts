/* eslint-disable */
// @ts-nocheck

import {
  InvalidValueForOptionError,
  OptionRequiredError,
  OptionRequiredToUseError,
} from '../../../../common/errorHandler/errorHandler';
import OptionsValidator from '../optionsValidator';

describe('OptionsValidator', () => {
  describe('validateOptions', () => {
    it('throws OptionRequiredError for missing host', () => {
      // Test case where host is missing
      const options = {}; // Missing host

      expect(() => OptionsValidator.validate(options)).toThrow(OptionRequiredError);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(OptionRequiredError);
        expect(error.message).toContain('host is required');
      }
    });

    it('throws InvalidValueForOptionError for invalid port', () => {
      // Test case where port is not a valid number
      const options = {
        host: 'example.com',
        port: 'abc', // Invalid port value
      };
      expect(() => OptionsValidator.validate(options)).toThrow(InvalidValueForOptionError);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidValueForOptionError);
        expect(error.message).toContain('port');
        expect(error.message).toContain('abc');
      }
    });

    it('throws OptionRequiredToUseError for missing collection with query', () => {
      // Test case where collection is missing while query is provided
      const options = {
        host: 'example.com',
        port: 27017,
        query: '...',
      };
      expect(() => OptionsValidator.validate(options)).toThrow(OptionRequiredToUseError);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(OptionRequiredToUseError);
        expect(error.message).toContain('collection');
        expect(error.message).toContain('query');
      }
    });

    it('throws an error for invalid verbose value', () => {
      // Test case where verbose value is not between 1 and 5
      const options = {
        host: 'example.com',
        port: 27017,
        verbose: 10,
      };
      expect(() => OptionsValidator.validate(options)).toThrow(InvalidValueForOptionError);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidValueForOptionError);
        expect(error.message).toContain('Invalid value');
        expect(error.message).toContain('between 1 and 5');
      }
    });

    it('throws an error for conflicting out and archive options', () => {
      // Test case where both out and archive options are provided
      const options = {
        host: 'example.com',
        port: 27017,
        out: 'output',
        archive: '/path/to/archive',
      };
      expect(() => OptionsValidator.validate(options)).toThrow(Error);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('out');
        expect(error.message).toContain('archive');
      }
    });

    it('throws OptionRequiredToUseError for missing archiveExtension with archive', () => {
      // Test case where archiveExtension is missing while archive is provided
      const options = {
        host: 'example.com',
        port: 27017,
        archive: '/path/to/archive',
      };
      expect(() => OptionsValidator.validate(options)).toThrow(OptionRequiredToUseError);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(OptionRequiredToUseError);
        expect(error.message).toContain('archiveExtension');
        expect(error.message).toContain('archive');
      }
    });

    it('throws an error when unnecessary options are used with config', () => {
      // Test case where unnecessary options are used with the config option
      const options = {
        config: 'my-config.json',
        host: 'example.com',
        port: 12345,
      };
      expect(() => OptionsValidator.validate(options)).toThrow(Error);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('host');
        expect(error.message).toContain('port');
        expect(error.message).toContain('config');
      }
    });

    it('throws an error for invalid cron schedule', () => {
      // Test case where an invalid cron schedule is provided
      const options = {
        host: 'example.com',
        port: 12345,
        schedule: 'invalid-cron',
      };
      expect(() => OptionsValidator.validate(options)).toThrow(InvalidValueForOptionError);
      try {
        OptionsValidator.validate(options);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidValueForOptionError);
        expect(error.message).toContain('schedule');
        expect(error.message).toContain('invalid-cron');
      }
    });

    it('validates options with a config object', () => {
      // Test case where options are validated using a config object
      const options = {
        config: 'my-config.json',
      };
      expect(() => OptionsValidator.validate(options)).not.toThrow();
    });

    it('validates array option', () => {
      // Test case where an array option is validated
      const options = {
        host: 'example.com',
        port: 12345,
        excludeCollection: ['item1', 'item2', 'item3'],
      };
      expect(() => OptionsValidator.validate(options)).not.toThrow();

      const invalidOptions = {
        host: 'example.com',
        port: 12345,
        excludeCollection: ['item1', 42, 'item3'],
      };
      expect(() => OptionsValidator.validate(invalidOptions)).toThrow(InvalidValueForOptionError);
      try {
        OptionsValidator.validate(invalidOptions);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidValueForOptionError);
        expect(error.message).toContain('excludeCollection');
        expect(error.message).toContain('42');
      }
    });

    it('handles valid options without errors', () => {
      // Test case where all valid options are provided without errors
      const options = {
        host: 'example.com',
        port: 12345,
        excludeCollection: ['item1', 'item2', 'item3'],
        out: 'output',
      };
      expect(() => OptionsValidator.validate(options)).not.toThrow();
    });
  });
});
