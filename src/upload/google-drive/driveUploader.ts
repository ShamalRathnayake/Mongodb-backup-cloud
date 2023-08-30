/* eslint-disable camelcase */
import { createReadStream, existsSync, lstatSync } from 'fs';
import path from 'path';

import globby from 'globby';
import { drive_v3, google } from 'googleapis';
import mime from 'mime-types';

import logConfig from '../../backup/config/logConfig';
import { OptionRequiredError } from '../../common/errorHandler/errorHandler';
import { UploadLogger } from '../../common/Logger/logger';
import { GDriveOptions } from '../../types/types';

class DriveUploader {
  private options: GDriveOptions;

  private driveClient!: drive_v3.Drive;

  private driveFolder!: drive_v3.Schema$File;

  private filePaths!: string[];

  constructor(options: GDriveOptions, enableLogs: boolean = false) {
    if (enableLogs) UploadLogger.toggleLogging(true);

    try {
      const { clientId, clientSecret, refreshToken, driveFolderName, filePath } = options;

      if (!clientId) throw new OptionRequiredError('Client id');
      if (!clientSecret) throw new OptionRequiredError('Client secret');
      if (!refreshToken) throw new OptionRequiredError('Refresh token');
      if (!driveFolderName) throw new OptionRequiredError('Drive folder name');
      if (!filePath) throw new OptionRequiredError('Filepath');

      this.options = options;
    } catch (error: unknown) {
      let errorMsg: string = 'Unknown error occurred.';

      if (error instanceof Error) errorMsg = error.message;
      else if (typeof error === 'string') errorMsg = error;

      UploadLogger.log(logConfig.types.error, errorMsg);
      throw error;
    }
  }

  private async initializeUploader({
    clientId,
    clientSecret,
    refreshToken,
    driveFolderName,
    filePath,
  }: GDriveOptions) {
    this.driveClient = this.createClient(clientId, clientSecret, refreshToken);
    this.driveFolder = await this.getDriveFolder(driveFolderName);
    UploadLogger.log(logConfig.types.debug, `Drive folder name - ${this.driveFolder.name}`);
    this.filePaths = await this.getPaths(filePath);
    UploadLogger.log(logConfig.types.debug, this.filePaths.toString());
  }

  private createClient(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): drive_v3.Drive {
    const client = new google.auth.OAuth2({
      clientId,
      clientSecret,
      redirectUri: 'https://developers.google.com/oauthplayground',
    });

    client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({
      version: 'v3',
      auth: client,
    });

    return drive;
  }

  private async getDriveFolder(folderName: string): Promise<drive_v3.Schema$File> {
    const { status, statusText, data } = await this.driveClient.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (status !== 200) throw new Error(statusText);
    let folder = data.files?.find((file) => file.name === folderName);

    if (!folder) {
      const createResult = await this.driveClient.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id, name',
      });
      if (createResult.status !== 200) throw new Error(createResult.statusText);
      else folder = createResult.data;
    }

    return folder;
  }

  private async getPaths(filePath: string): Promise<string[]> {
    if (!existsSync(filePath)) throw new Error('File path does not exist');
    const isDirectory = lstatSync(filePath).isDirectory();
    if (!isDirectory) return [filePath];
    let globPath = path.posix.join(path.relative(process.cwd(), filePath), '**');
    if (process.platform === 'win32') globPath = globPath.replace(/\\/g, '/');
    const paths = await globby(globPath);
    return paths;
  }

  private async createParentFolders(parents: string[]): Promise<string> {
    let immediateParent: string = this.driveFolder.id as string;

    // eslint-disable-next-line no-restricted-syntax
    for (const parent of parents) {
      // eslint-disable-next-line no-await-in-loop
      const checkResult = await this.driveClient.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${parent}' and parents in '${immediateParent}' and trashed=false`,
        fields: 'files(id, name)',
      });
      if (checkResult.status !== 200) throw new Error(checkResult.statusText);

      const folder = checkResult.data.files?.find((file) => file.name === parent);

      if (folder) {
        immediateParent = folder.id as string;
      } else {
        const folderMetaData = {
          name: parent,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [immediateParent],
        };

        // eslint-disable-next-line no-await-in-loop
        const { status, statusText, data } = await this.driveClient.files.create({
          requestBody: folderMetaData,
          fields: 'id',
        });

        if (status !== 200) throw new Error(statusText);
        immediateParent = data.id as string;
      }
    }

    return immediateParent as string;
  }

  private async uploadToDrive(filePath: string, parents: string[] = []) {
    const fileName = path.basename(filePath);
    const mimeType = mime.lookup(filePath) || '*/*';
    const fullPath = path.resolve(__dirname, path.relative(__dirname, filePath));

    let parentFolder: string = this.driveFolder.id as string;

    if (parents.length > 0) {
      parentFolder = await this.createParentFolders(parents);
    }

    const checkResult = await this.driveClient.files.list({
      q: `mimeType!='application/vnd.google-apps.folder' and name='${fileName}' and parents in '${parentFolder}' and trashed=false`,
      fields: 'files(id, name)',
    });
    if (checkResult.status !== 200) throw new Error(checkResult.statusText);
    const existingFile = checkResult.data.files?.find((file) => file.name === fileName);
    if (existingFile) return `${filePath} already exists`;

    UploadLogger.log(logConfig.types.info, `Starting upload of ${filePath}`);
    const { status, statusText, data } = await this.driveClient.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [parentFolder],
      },
      media: {
        mimeType,
        body: createReadStream(fullPath),
      },
    });

    if (status !== 200) throw new Error(statusText);

    UploadLogger.log(logConfig.types.info, `Done uploading ${filePath}`);

    return data;
  }

  public async upload() {
    try {
      UploadLogger.log(logConfig.types.info, 'initializing drive uploader');
      await this.initializeUploader(this.options);
      UploadLogger.log(logConfig.types.info, 'Drive uploader initialized');

      const allUploadedData = [];

      UploadLogger.log(logConfig.types.info, 'Starting upload process to drive');
      // eslint-disable-next-line no-restricted-syntax
      for (const filePath of this.filePaths) {
        const parents = path.dirname(filePath).split('/');
        parents.shift();
        // eslint-disable-next-line no-await-in-loop
        const uploadedData = await this.uploadToDrive(filePath, parents);

        allUploadedData.push(uploadedData);
      }

      UploadLogger.log(logConfig.types.info, 'Upload process complete');

      return allUploadedData;
    } catch (error) {
      let errorMsg: string = 'Unknown error occurred.';

      if (error instanceof Error) errorMsg = error.message;
      else if (typeof error === 'string') errorMsg = error;

      UploadLogger.log(logConfig.types.error, errorMsg);

      throw error;
    }
  }
}

export default DriveUploader;
