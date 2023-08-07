import CommandGenerator from '../commandGenerator';

const pathOptions = {
  parentDirectory: '/path/to/parent',
  backupPath: '/path/to/backup',
  backupDirectory: 'backupDir',
  oldBackupPath: '/path/to/oldBackup',
  oldBackupDirectory: 'oldBackupDir',
};

describe('CommandGenerator - Private Methods', () => {
  it('prepareStringOption should return the expected string', () => {
    // Test implementation
    const options = {
      host: 'localhost',
      port: 27017,
      username: 'admin',
      password: 'password123',
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();

    // Test against the expected backup command based on the provided options
    const expectedBackupCommand =
      'mongodump --host=localhost --port=27017 --username=admin --password=password123';
    expect(backupCommand).toBe(expectedBackupCommand);
  });

  it('prepareNumberOption should return the expected string', () => {
    // Test implementation
    const options = {
      host: 'localhost',
      port: 27017,
      verbose: 2,
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();

    // Test against the expected backup command based on the provided options
    const expectedBackupCommand = 'mongodump --host=localhost --port=27017 -vv';
    expect(backupCommand).toBe(expectedBackupCommand);
  });

  it('prepareBooleanOption should return the expected string', () => {
    // Test implementation
    const options = {
      host: 'localhost',
      port: 27017,
      ssl: true,
      quiet: true,
      gzip: false,
      oplog: true,
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();

    // Test against the expected backup command based on the provided options
    const expectedBackupCommand = 'mongodump --host=localhost --port=27017 --ssl --quiet --oplog';
    expect(backupCommand).toBe(expectedBackupCommand);
  });

  it('prepareStringArrayOption should return the expected string', () => {
    // Test implementation
    const options = {
      host: 'localhost',
      port: 27017,
      excludeCollection: ['collection1', 'collection2'],
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();

    // Test against the expected backup command based on the provided options
    const expectedBackupCommand =
      'mongodump --host=localhost --port=27017 --excludeCollection=collection1 --excludeCollection=collection2';
    expect(backupCommand).toBe(expectedBackupCommand);
  });

  it('prepareDeleteCommand should return the expected command', () => {
    // Test implementation

    const options = {
      host: 'localhost',
      port: 27017,
      removeOldBackups: true,
      oldBackupPath: './oldBackup',
      oldBackupDirectory: 'oldBackupDir',
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const deleteCommand = commandGenerator.getDeleteCommand();

    // Test against the expected delete command based on the provided options
    const expectedDeleteCommand = 'rmdir /Q /S .\\oldBackup';
    expect(deleteCommand).toBe(expectedDeleteCommand);
  });
});

describe('CommandGenerator - Integration testing', () => {
  it('getBackupCommand should return the correct command', () => {
    // Test implementation

    const options = {
      host: 'localhost',
      port: 27017,
      ssl: true,
      quiet: true,
      gzip: false,
      oplog: true,
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();

    // Test against the expected backup command based on the provided options
    const expectedBackupCommand = 'mongodump --host=localhost --port=27017 --ssl --quiet --oplog';
    expect(backupCommand).toBe(expectedBackupCommand);
  });

  it('getDeleteCommand should return the correct command', () => {
    // Test implementation
    const options = {
      host: 'localhost',
      port: 27017,
      removeOldBackups: true,
      removeOldDir: true,
      oldBackupPath: '/path/to/oldBackup',
      oldBackupDirectory: 'oldBackupDir',
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const deleteCommand = commandGenerator.getDeleteCommand();

    // Test against the expected delete command when removeOldBackups is true
    const expectedDeleteCommand = 'rmdir /Q /S \\path\\to\\oldBackup';
    expect(deleteCommand).toBe(expectedDeleteCommand);
  });

  it('should return an empty delete command when deleteOldBackups is false', () => {
    const options = {
      host: 'localhost',
      port: 27017,
      removeOldBackups: false,
      removeOldDir: true,
      oldBackupPath: '/path/to/oldBackup',
      oldBackupDirectory: 'oldBackupDir',
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const deleteCommand = commandGenerator.getDeleteCommand();

    // Test against an empty delete command when deleteOldBackups is false
    const expectedDeleteCommand = '';
    expect(deleteCommand).toBe(expectedDeleteCommand);
  });

  it('constructor should generate the correct commands', () => {
    // Test implementation
    const options = {
      host: 'localhost',
      port: 27017,
      ssl: true,
      quiet: true,
      gzip: false,
      oplog: true,
      removeOldBackups: true,
      removeOldDir: true,
      oldBackupPath: '/path/to/oldBackup',
      oldBackupDirectory: 'oldBackupDir',
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();
    const deleteCommand = commandGenerator.getDeleteCommand();

    // Test against the expected backup command based on the provided options
    const expectedBackupCommand = 'mongodump --host=localhost --port=27017 --ssl --quiet --oplog';
    expect(backupCommand).toBe(expectedBackupCommand);

    // Test against the expected delete command when deleteOldBackups is true
    const expectedDeleteCommand = 'rmdir /Q /S \\path\\to\\oldBackup'; // Modify based on your logic
    expect(deleteCommand).toBe(expectedDeleteCommand);
  });

  it('constructor should generate the correct commands with specific options', () => {
    // Test implementation
    const options = {
      host: 'localhost',
      port: 27017,
      ssl: true,
      quiet: true,
      gzip: false,
      oplog: true,
      removeOldBackups: true,
      removeOldDir: true,
      oldBackupPath: '/path/to/oldBackup',
      oldBackupDirectory: 'oldBackupDir',
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();
    const deleteCommand = commandGenerator.getDeleteCommand();

    // Test against the expected backup command based on the provided options
    const expectedBackupCommand = 'mongodump --host=localhost --port=27017 --ssl --quiet --oplog';
    expect(backupCommand).toBe(expectedBackupCommand);

    // Test against the expected delete command when deleteOldBackups is true
    const expectedDeleteCommand = 'rmdir /Q /S \\path\\to\\oldBackup';
    expect(deleteCommand).toBe(expectedDeleteCommand);
  });
});

describe('CommandGenerator', () => {
  it('getBackupCommand snapshot', () => {
    // Test implementation and compare snapshot
    const options = {
      host: 'localhost',
      port: 27017,
      ssl: true,
      quiet: true,
      gzip: false,
      oplog: true,
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const backupCommand = commandGenerator.getBackupCommand();

    // Use Jest's snapshot testing to capture and compare the generated backup command
    expect(backupCommand).toMatchSnapshot();
  });

  it('getDeleteCommand snapshot', () => {
    // Test implementation and compare snapshot
    const options = {
      host: 'localhost',
      port: 27017,
      deleteOldBackups: true,
      removeOldDir: true,
      oldBackupPath: '/path/to/oldBackup',
      oldBackupDirectory: 'oldBackupDir',
    };

    const commandGenerator = new CommandGenerator(options, pathOptions);

    const deleteCommand = commandGenerator.getDeleteCommand();

    // Use Jest's snapshot testing to capture and compare the generated delete command
    expect(deleteCommand).toMatchSnapshot();
  });
});
