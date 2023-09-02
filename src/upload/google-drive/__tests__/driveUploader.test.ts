/* eslint-disable */
// @ts-nocheck

import DriveUploader from '../driveUploader';
import { OptionRequiredError } from '../../../common/errorHandler/errorHandler';
import { google } from 'googleapis';
import * as fs from 'fs';

jest.mock('../../../common/Logger/logger.ts');
jest.mock('fs');

describe('DriveUploader', () => {
  let driveUploader;

  const mockDriveClient = {
    files: {
      list: jest.fn(),
      create: jest.fn(),
    },
  };

  const options = {
    clientId: 'client-id',
    clientSecret: 'client-secret',
    refreshToken: 'refresh-token',
    driveFolderName: 'drive-folder',
    filePath: '/path/to/file',
  };

  beforeEach(() => {
    driveUploader = new DriveUploader(options, false);

    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('should throw OptionRequiredError for missing options', () => {
      const missingOptions = {};
      delete missingOptions.clientId;

      expect(() => new DriveUploader(missingOptions, false)).toThrow(OptionRequiredError);
    });

    it('should initialize options correctly', () => {
      expect(driveUploader.options).toEqual(options);
    });

    it('should throw an error for unknown errors during constructor', () => {
      const invalidOptions = [1, 2, 3];

      expect(() => new DriveUploader(invalidOptions, false)).toThrow();
    });
  });

  describe('initializeUploader', () => {
    it('should initialize the uploader correctly', async () => {
      driveUploader.createClient = jest.fn(() => mockDriveClient);
      driveUploader.getDriveFolder = jest.fn().mockReturnValue({ id: 1, name: 'drive-folder' });
      driveUploader.getPaths = jest.fn().mockReturnValue(['/path/to/file']);

      await driveUploader.initializeUploader(options);

      expect(driveUploader.createClient).toHaveBeenCalledWith(
        options.clientId,
        options.clientSecret,
        options.refreshToken
      );

      expect(driveUploader.getDriveFolder).toHaveBeenCalledWith(options.driveFolderName);
      expect(driveUploader.getPaths).toHaveBeenCalledWith(options.filePath);
    });
  });

  describe('createClient', () => {
    it('should create a Drive client correctly', async () => {
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
      };

      const oauth2ConstructorSpy = jest.spyOn(google.auth, 'OAuth2');
      oauth2ConstructorSpy.mockReturnValue(mockOAuth2Client);

      const driveSpy = jest.spyOn(google, 'drive');
      driveSpy.mockReturnValue(mockDriveClient);

      const driveClient = driveUploader.createClient(
        options.clientId,
        options.clientSecret,
        options.refreshToken
      );

      expect(oauth2ConstructorSpy).toHaveBeenCalledWith({
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        redirectUri: 'https://developers.google.com/oauthplayground',
      });

      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        refresh_token: options.refreshToken,
      });

      expect(driveClient).toBe(mockDriveClient);

      oauth2ConstructorSpy.mockRestore();
      driveSpy.mockRestore();
    });
  });

  describe('getDriveFolder', () => {
    it('should find an existing folder', async () => {
      const folderName = 'existing-folder-name';
      const expectedFolder = {
        name: folderName,
        id: 'folder-id',
      };

      mockDriveClient.files.list.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {
          files: [expectedFolder],
        },
      });

      driveUploader.driveClient = mockDriveClient;

      const result = await driveUploader.getDriveFolder(folderName);

      expect(result).toEqual(expectedFolder);

      expect(mockDriveClient.files.list).toHaveBeenCalledWith({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        fields: 'files(id, name)',
      });
    });

    it('should create a new folder if not found', async () => {
      const folderName = 'new-folder-name';
      const newFolder = {
        name: folderName,
        id: 'folder-id',
      };

      mockDriveClient.files.list.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {
          files: [],
        },
      });

      mockDriveClient.files.create.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: newFolder,
      });

      driveUploader.driveClient = mockDriveClient;

      const result = await driveUploader.getDriveFolder(folderName);

      expect(result).toEqual(newFolder);

      expect(mockDriveClient.files.create).toHaveBeenCalledWith({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id, name',
      });
    });

    it('should throw an error if API status is not 200', async () => {
      const folderName = 'new-folder-name';
      const errorMsg = 'Custom error message';
      mockDriveClient.files.list.mockResolvedValueOnce({
        status: 400,
        statusText: errorMsg,
        data: {
          files: [],
        },
      });

      driveUploader.driveClient = mockDriveClient;

      await expect(driveUploader.getDriveFolder(folderName)).rejects.toThrowError(errorMsg);
    });
  });

  describe('upload', () => {
    it('should initialize uploader and upload files', async () => {
      driveUploader.getDriveFolder = jest.fn().mockReturnValue({ id: 1, name: 'drive-folder' });
      driveUploader.getPaths = jest.fn().mockReturnValue(['/path/to/file']);
      driveUploader.createParentFolders = jest.fn().mockReturnValue('parent-id');

      const newFolder = {
        name: 'file.txt',
        id: 'file-id',
      };

      mockDriveClient.files.list.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {
          files: [],
        },
      });

      mockDriveClient.files.create.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: newFolder,
      });

      driveUploader.createClient = jest.fn(() => mockDriveClient);

      const result = await driveUploader.upload();

      expect(result).toEqual([newFolder]);
    });

    it('should handle errors during upload process', async () => {
      driveUploader.getDriveFolder = jest.fn().mockReturnValue({ id: 1, name: 'drive-folder' });
      driveUploader.getPaths = jest.fn().mockReturnValue(['/path/to/file']);
      driveUploader.createParentFolders = jest.fn().mockReturnValue('parent-id');

      const errorMsg = 'Uploading file failed';

      const newFolder = {
        name: 'file.txt',
        id: 'file-id',
      };

      mockDriveClient.files.list.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {
          files: [],
        },
      });

      mockDriveClient.files.create.mockResolvedValueOnce({
        status: 400,
        statusText: errorMsg,
        data: newFolder,
      });

      driveUploader.createClient = jest.fn(() => mockDriveClient);

      await expect(driveUploader.upload()).rejects.toThrowError(errorMsg);
    });
  });
});
