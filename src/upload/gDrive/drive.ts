import { drive_v3, google } from 'googleapis';
import fs from 'fs';
import path from 'path';
const mime = require('mime-types');
const globby = require('globby');

export const createDriveClient = (clientId: string, clientSecret: string, refreshToken: string) => {
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
};

export const getDriveFolder = async (driveClient: drive_v3.Drive, folderName: string) => {
  const { status, statusText, data } = await driveClient.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
    fields: 'files(id, name)',
  });
  if (status !== 200) throw new Error(statusText);
  let folder = data.files?.find((file) => file.name === folderName);

  if (!folder) {
    const createResult = await driveClient.files.create({
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
};

export const uploadFiles = async (driveClient: drive_v3.Drive, folder: drive_v3.Schema$File, filePath: string) => {
  if (!fs.existsSync(filePath)) throw new Error('File path does not exist');
  const isDirectory = fs.lstatSync(filePath).isDirectory();
  if (!isDirectory) {
    const uploadedData = await uploadToDrive(driveClient, folder.id as string, filePath);
    return [uploadedData];
  } else {
    let globPath = path.posix.join(path.relative(process.cwd(), filePath), '**');
    if (process.platform === 'win32') globPath = globPath.replace(/\\/g, '/');
    const paths = await globby(globPath);
    const allUploadedData = [];
    for (const _path of paths) {
      const parents = path
        .relative(path.resolve(__dirname, path.relative(__dirname, filePath)), _path)
        .split(process.platform === 'win32' ? '\\' : '/');

      parents.splice(-1, 1);

      const uploadedData = await uploadToDrive(driveClient, folder.id as string, _path, parents);
      allUploadedData.push(uploadedData);
    }
    return allUploadedData;
  }
};

const uploadToDrive = async (
  driveClient: drive_v3.Drive,
  folderId: string,
  filePath: string,
  parents: string[] = []
) => {
  const fileName = path.basename(filePath);
  const mimeType = mime.lookup(filePath);
  const fullPath = path.resolve(__dirname, path.relative(__dirname, filePath));
  const fileContent = fs.readFileSync(fullPath, { encoding: 'base64' });
  let parentFolder = folderId;
  if (parents.length > 0) {
    parentFolder = await createParentFolders(driveClient, parents, folderId);
  }
  const { status, statusText, data } = await driveClient.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: [parentFolder],
    },
    media: {
      mimeType,
      body: fileContent,
    },
  });
  if (status !== 200) throw new Error(statusText);
  return data;
};

const createParentFolders = async (driveClient: drive_v3.Drive, parents: string[], parentId: string) => {
  let prevParentId = parentId;

  for (const parent of parents) {
    const checkResult = await driveClient.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${parent}' and parents in '${prevParentId}'`,
      fields: 'files(id, name)',
    });
    if (checkResult.status !== 200) throw new Error(checkResult.statusText);
    let folder = checkResult.data.files?.find((file) => file.name === parent);
    if (folder) prevParentId = folder.id as string;
    else {
      const { status, statusText, data } = await driveClient.files.create({
        requestBody: {
          name: parent,
          parents: [prevParentId],
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id, name',
      });

      if (status !== 200) throw new Error(statusText);
      prevParentId = data.id as string;
    }
  }

  return prevParentId;
};
