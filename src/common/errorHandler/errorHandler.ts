/* eslint-disable max-classes-per-file */
class OptionRequiredError extends Error {
  constructor(optionName: string) {
    super(`${optionName} is required`);
    Object.setPrototypeOf(this, OptionRequiredError.prototype);
    this.name = 'OptionRequiredError';
  }
}

class InvalidOptionError extends Error {
  constructor(optionName: string) {
    super(`Invalid option: ${optionName}`);
    Object.setPrototypeOf(this, InvalidOptionError.prototype);
    this.name = 'InvalidOptionError';
  }
}

class InvalidValueForOptionError extends Error {
  constructor(optionName: string, option: unknown) {
    super(`Invalid value for ${optionName}: ${option}`);
    Object.setPrototypeOf(this, InvalidValueForOptionError.prototype);
    this.name = 'InvalidValueForOptionError';
  }
}

class OptionRequiredToUseError extends Error {
  constructor(requiredOption: string, givenOption: string) {
    super(`${requiredOption} option is required to use ${givenOption} option`);
    Object.setPrototypeOf(this, OptionRequiredToUseError.prototype);
    this.name = 'OptionRequiredToUseError';
  }
}

export {
  OptionRequiredError,
  InvalidOptionError,
  InvalidValueForOptionError,
  OptionRequiredToUseError,
};
