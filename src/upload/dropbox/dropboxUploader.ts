import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { stringify } from 'querystring';

import axios from 'axios';
import { Dropbox, DropboxAuth } from 'dropbox';

import logConfig from '../../backup/config/logConfig';
import { OptionRequiredError } from '../../common/errorHandler/errorHandler';
import { UploadLogger } from '../../common/Logger/logger';
import { DropboxConfiguration, DropBoxOptions } from '../../types/types';

class DropboxUploader {
  private options: DropBoxOptions;

  private dropboxClient!: Dropbox;

  private dropBoxFolder!: any;

  /*  private filePaths!: string[]; */

  private readonly accessTokenUrl: string = 'https://api.dropbox.com/oauth2/token/';

  private readonly configurationFile: string = 'config.json';

  private readonly configurationPath: string = 'dropbox-config';

  constructor(options: DropBoxOptions, enableLogs: boolean = false) {
    if (enableLogs) UploadLogger.toggleLogging(true);

    try {
      const { clientId, clientSecret, authCode, dropboxFolderName, filePath } = options;

      if (!clientId) throw new OptionRequiredError('Client id');
      if (!clientSecret) throw new OptionRequiredError('Client secret');
      if (!authCode) throw new OptionRequiredError('Auth code');
      if (!dropboxFolderName) throw new OptionRequiredError('Dropbox folder name');
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

  private async checkConfiguration(): Promise<DropboxConfiguration> {
    UploadLogger.log(
      logConfig.types.info,
      `Checking dropbox configuration at ${this.configurationPath}/${this.configurationFile}`
    );

    if (existsSync(`${this.configurationPath}/${this.configurationFile}`)) {
      const config = readFileSync(`${this.configurationPath}/${this.configurationFile}`, {
        encoding: 'utf-8',
      });

      const existingConfiguration = JSON.parse(config);

      if (existingConfiguration.code === this.options.authCode) {
        UploadLogger.log(logConfig.types.info, 'existing latest dropbox configuration found');
        return existingConfiguration;
      }

      UploadLogger.log(logConfig.types.info, 'Dropbox configuration outdated');
    }

    UploadLogger.log(logConfig.types.info, 'Retrieving access token from auth code');

    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new Error('Retrieving access token failed');
    }

    try {
      if (!existsSync(`${this.configurationPath}/${this.configurationFile}`)) {
        mkdirSync(this.configurationPath);
      }
      UploadLogger.log(logConfig.types.info, 'Writing latest configuration to file');
      writeFileSync(
        `${this.configurationPath}/${this.configurationFile}`,
        JSON.stringify(accessToken)
      );
    } catch (error) {
      throw new Error('Writing dropbox config to file failed');
    }

    return accessToken;
  }

  private async getAccessToken() {
    try {
      const accessTokenResponse = await axios.post(
        this.accessTokenUrl,
        stringify({
          client_id: this.options.clientId,
          client_secret: this.options.clientSecret,
          grant_type: 'authorization_code',
          code: this.options.authCode,
        })
      );

      if (accessTokenResponse?.data && accessTokenResponse.data?.access_token)
        return { ...accessTokenResponse.data, code: this.options.authCode };

      return null;
    } catch (error: any) {
      if (error?.response?.data?.error_description)
        throw new Error(error?.response?.data?.error_description);
      throw error;
    }
  }

  private async createClient(accessToken: string, refreshToken: string): Promise<Dropbox> {
    try {
      const dropboxAuthClient = new DropboxAuth({
        clientId: this.options.clientId,
        clientSecret: this.options.clientSecret,
        accessToken,
        refreshToken,
      });

      const dropbox = new Dropbox({
        auth: dropboxAuthClient,
      });

      const user = await dropbox.checkUser({
        query: 'foo',
      });

      if (user.status !== 200 || user.result.result !== 'foo')
        throw new Error('Dropbox connection failed');

      return dropbox;
    } catch (error: any) {
      console.log(
        '🚀 ~ file: dropboxUploader.ts:113 ~ DropboxUploader ~ createClient ~ error:',
        error
      );
      if (error?.response?.data?.error_description)
        throw new Error(error?.response?.data?.error_description);
      throw error;
    }
  }

  private async getDropboxFolder() {
    try {
      const response = await this.dropboxClient.filesListFolder({
        path: `/${this.options.dropboxFolderName}`,
        include_deleted: false,
      });
      console.log(
        '🚀 ~ file: dropboxUploader.ts:158 ~ DropboxUploader ~ getDropboxFolder ~ response:',
        response
      );
    } catch (error) {
      console.log(
        '🚀 ~ file: dropboxUploader.ts:156 ~ DropboxUploader ~ getDropboxFolder ~ error:',
        error
      );
    }
  }

  public async initializeUploader() {
    const dropboxConfiguration = await this.checkConfiguration();
    console.log(
      '🚀 ~ file: dropboxUploader.ts:86 ~ DropboxUploader ~ initializeUploader ~ dropboxConfiguration:',
      dropboxConfiguration
    );

    this.dropboxClient = await this.createClient(
      dropboxConfiguration.access_token,
      dropboxConfiguration.refresh_token
    );

    this.dropBoxFolder = await this.getDropboxFolder();
    console.log(
      '🚀 ~ file: dropboxUploader.ts:182 ~ DropboxUploader ~ initializeUploader ~ this.dropBoxFolder:',
      this.dropBoxFolder
    );

    /* this.driveClient = this.createClient(clientId, clientSecret, refreshToken);
    this.driveFolder = await this.getDriveFolder(driveFolderName);
    UploadLogger.log(logConfig.types.debug, `Drive folder name - ${this.driveFolder.name}`);
    this.filePaths = await this.getPaths(filePath);
    UploadLogger.log(logConfig.types.debug, this.filePaths.toString()); */
  }

  public async upload() {
    try {
      UploadLogger.log(logConfig.types.info, 'Initializing dropbox uploader');
      await this.initializeUploader();
      UploadLogger.log(logConfig.types.info, 'Dropbox uploader initialized');
    } catch (error) {
      console.log('🚀 ~ file: dropboxUploader.ts:211 ~ DropboxUploader ~ upload ~ error:', error);
      let errorMsg: string = 'Unknown error occurred.';

      if (error instanceof Error) errorMsg = error.message;
      else if (typeof error === 'string') errorMsg = error;

      UploadLogger.log(logConfig.types.error, errorMsg);

      throw error;
    }
  }
}

export default DropboxUploader;
