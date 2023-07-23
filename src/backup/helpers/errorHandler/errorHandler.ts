class OptionRequiredError extends Error {
  constructor(optionName: string) {
    super(`${optionName} is required`);
    this.name = 'OptionRequiredError';
  }
}

class InvalidOptionError extends Error {
  constructor(optionName: string) {
    super(`Invalid option: ${optionName}`);
    this.name = 'InvalidOptionError';
  }
}

class InvalidValueForOptionError extends Error {
  constructor(optionName: string, option: unknown) {
    super(`Invalid value for ${optionName}: ${option}`);
    this.name = 'InvalidValueForOptionError';
  }
}

class OptionRequiredToUseError extends Error {
  constructor(requiredOption: string, givenOption: string) {
    super(`${requiredOption} option is required to use ${givenOption} option`);
    this.name = 'OptionRequiredToUseError';
  }
}

export {
  OptionRequiredError,
  InvalidOptionError,
  InvalidValueForOptionError,
  OptionRequiredToUseError,
};
