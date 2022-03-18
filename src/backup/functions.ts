import * as cron from 'node-cron';
import * as fs from 'fs';
import { exec } from 'child_process';
import { join } from 'path';
import { CommonOptions, DirectOptions, URIOptions } from '../types/types';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const generateOptionString = ({
  verbose,
  quiet,
  readPreference,
  gzip,
  database,
  collection,
  query,
  queryFilePath,
  dumpUsersAndRoles,
  excludeCollection,
  excludeWithPrefix,
  parallel,
  viewsAsCollections,
}: CommonOptions) => {
  if (query && !collection) throw new Error('Collection option is required to use query option');

  let optionsString = '';

  if (quiet) optionsString += ' --quiet';
  if (readPreference) optionsString += ` --readPreference=${readPreference}`;
  if (gzip) optionsString += ' --gzip';
  if (database) optionsString += ` --db=${database}`;
  if (collection) optionsString += ` --collection=${collection}`;
  if (query) optionsString += ` --query=${query}`;
  if (queryFilePath) optionsString += ` --queryFile=${queryFilePath}`;
  if (dumpUsersAndRoles) optionsString += ' --dumpDbUsersAndRoles';
  if (parallel) optionsString += ` -j=${parallel}`;
  if (viewsAsCollections) optionsString += ` --viewsAsCollections`;
  if (verbose) {
    if (isNaN(verbose) || verbose > 5 || verbose < 1) {
      throw new Error('Verbose option can only be a value 1-5');
    }
    optionsString += ' -' + 'v'.repeat(verbose);
  }
  if (excludeCollection && excludeCollection.length > 0) {
    for (const collection of excludeCollection) {
      optionsString += ` --excludeCollection=${collection}`;
    }
  }
  if (excludeWithPrefix && excludeWithPrefix.length > 0) {
    for (const prefix of excludeWithPrefix) {
      optionsString += ` --excludeCollectionsWithPrefix=${prefix}`;
    }
  }

  return optionsString;
};

export const extendedOptionString = ({
  host,
  port,
  username,
  password,
  ...rest
}: DirectOptions) => {
  if (!host.trim()) throw new Error('Host is required');
  if (!port.trim()) throw new Error('Port is required');

  let optionsString = `--host=${host.trim()} --port=${port.trim()}`;

  if (username) optionsString += ` --username=${username}`;
  if (password) optionsString += ` --password=${password}`;

  optionsString += generateOptionString(rest);

  return optionsString;
};

export const generatePathOptions = ({
  outputPath,
  archive,
  removeOldBackups = true,
  localBackupRange = 7,
  archiveExtension = '',
}: CommonOptions) => {
  let defaultOutputPath = '';
  const directoryName = getDirectoryName(new Date());
  const pathName = `${directoryName}/${getFileName(new Date())}`;

  if (outputPath && archive) {
    throw new Error('Both outputPath and archive options cannot be used at once');
  } else if (!outputPath && !archive) {
    defaultOutputPath = './backup';
    dirCheck(defaultOutputPath);
  } else if (outputPath) {
    const path = join(outputPath, directoryName);
    dirCheck(path);
  } else if (archive) {
    const path = join(archive, directoryName);
    dirCheck(path);
  }

  let oldBackupDirectory = '';
  let oldBackupPath = '';

  if (removeOldBackups === true) {
    const date = new Date();
    const oldDate = new Date(date.setDate(date.getDate() - localBackupRange));
    oldBackupDirectory = getDirectoryName(oldDate);
    oldBackupPath = `${oldBackupDirectory}/${getFileName(oldDate)}`;
  }

  return {
    options: generatePaths(
      true,
      pathName,
      true,
      outputPath,
      archive,
      defaultOutputPath,
      archiveExtension
    ),
    backupDir: generatePaths(
      false,
      directoryName,
      false,
      outputPath,
      archive,
      defaultOutputPath,
      archiveExtension
    ).trim(),
    backupPath: generatePaths(
      false,
      pathName,
      true,
      outputPath,
      archive,
      defaultOutputPath,
      archiveExtension
    ).trim(),
    oldBackupDir: generatePaths(
      false,
      oldBackupDirectory,
      false,
      outputPath,
      archive,
      defaultOutputPath,
      archiveExtension
    ).trim(),
    oldBackupPath: generatePaths(
      false,
      oldBackupPath,
      true,
      outputPath,
      archive,
      defaultOutputPath,
      archiveExtension
    ).trim(),
  };
};

const getDirectoryName = (date: Date) =>
  `${new Date(date).getFullYear()}_${new Date(date).getMonth() + 1}_${new Date(date).getDate()}`;

const getFileName = (date: Date) =>
  `${`0${new Date(date).getHours()}`.slice(-2)}H_${`0${new Date(date).getMinutes()}`.slice(
    -2
  )}M_${`0${new Date(date).getSeconds()}`.slice(-2)}S`;

const dirCheck = (path: string): void => {
  if (!fs.existsSync(path))
    fs.mkdirSync(path, {
      recursive: true,
    });
};

const generatePaths = (
  opt: boolean,
  path: string,
  ext: boolean,
  outputPath: string | undefined,
  archive: string | undefined,
  defaultOutputPath: string,
  archiveExtension: string
) =>
  `${opt ? ' ' : ''}${
    outputPath
      ? `${opt ? '--out=' : ''}${outputPath}/${path}`
      : archive
      ? ''
      : `${opt ? '--out=' : ''}${defaultOutputPath}/${path}`
  } ${
    archive
      ? `${opt ? '--archive=' : ''}${archive}/${path}${
          archiveExtension && ext ? `.${archiveExtension}` : ''
        }`
      : ''
  }`;

const deleteOldBackups = async (filePath: string, fileDir: string, removeOldDir?: boolean) => {
  let command = '';
  if (removeOldDir === true) {
    command =
      process.platform === 'win32'
        ? `rmdir /Q /S ${fileDir.replace(/\//g, '\\')}`
        : `rm -rf ${fileDir}`;
  } else {
    command =
      process.platform === 'win32'
        ? `del /f ${filePath.replace(/\//g, '\\')}`
        : `rm -f ${filePath}`;
  }

  const { stderr, stdout } = await execAsync(command);
  return { status: !stderr, stdout, stderr };
};

const backupDatabase = async (command: string) => {
  const { stdout, stderr } = await execAsync(command);
  return { stdout, log: stderr };
};

export const handleBackupProcess = async (options: URIOptions | DirectOptions, cmd: string) => {
  if (!options.schedule) {
    const filePathOptions = generatePathOptions(options);
    cmd = `${cmd} ${filePathOptions.options}`;
    let output = await backupDatabase(cmd);
    let deleteStatus = {};

    if (options.removeOldBackups === true && options.oldBackupPath) {
      if (!fs.existsSync(options.oldBackupPath)) throw new Error('Invalid old backup path');

      const isDir = fs.lstatSync(options.oldBackupPath).isDirectory();

      deleteStatus = await deleteOldBackups(options.oldBackupPath, options.oldBackupPath, isDir);
    }

    return {
      backupPath: filePathOptions.backupPath,
      output,
      deleteStatus,
    };
  } else {
    if (!cron.validate(options.schedule)) throw new Error('Invalid cron schedule expression');

    cron.schedule(options.schedule, async () => {
      const {
        options: pathOptions,
        backupDir,
        backupPath,
        oldBackupDir,
        oldBackupPath,
      } = generatePathOptions(options);
      cmd = `${cmd} ${pathOptions}`;
      const output = await backupDatabase(cmd);

      let scheduleOutput = {
        backupPath,
        backupDir,
        oldBackupPath,
        oldBackupDir,
        output,
        deleteStatus: {},
      };

      if (options.removeOldBackups === true) {
        scheduleOutput.deleteStatus = await deleteOldBackups(
          oldBackupPath,
          oldBackupDir,
          options.removeOldDir
        );
      }

      if (options.scheduleCallback) options.scheduleCallback(scheduleOutput);
      else return scheduleOutput;
    });
  }
};
