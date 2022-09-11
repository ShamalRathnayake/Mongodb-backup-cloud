import { drive_v3 } from 'googleapis';
import { GDriveOptions, GithubOptions } from '../types/types';
import { createDriveClient, getDriveFolder, uploadFiles } from './gDrive/drive';
import {
  createCommit,
  createTree,
  filesToBlobs,
  getAuthUser,
  getBranch,
  getLatestCommit,
  getRepository,
  init,
  updateRef,
} from './github/github';

export default class Upload {
  static async toGitHub(options: GithubOptions) {
    const { token, repository, email, filePath } = options;
    const branch = options.branch?.replace(/ /g, '-');

    if (!token) throw new Error('Github personal access token is required');
    if (!repository) throw new Error('Repository name is required');
    if (!branch) throw new Error('Branch name is required');

    const octokit = init(token);

    const authUser = await getAuthUser(octokit);

    const remoteRepository = await getRepository(octokit, authUser.login, repository);

    const remoteBranch = await getBranch(octokit, authUser.login, remoteRepository.name, branch);

    const latestCommit = await getLatestCommit(
      octokit,
      authUser.login,
      remoteRepository.name,
      remoteBranch.name
    );

    const fileBlobs = await filesToBlobs(octokit, authUser.login, remoteRepository.name, filePath);

    const treeData = await createTree(
      octokit,
      authUser.login,
      remoteRepository.name,
      fileBlobs,
      latestCommit.treeSha
    );

    const commit = await createCommit(
      octokit,
      authUser.login,
      email,
      remoteRepository.name,
      treeData.sha,
      latestCommit.commitSha
    );

    const ref = await updateRef(
      octokit,
      authUser.login,
      remoteRepository.name,
      remoteBranch.name,
      commit.sha
    );

    return ref;
  }

  static async toGoogleDrive(options: GDriveOptions) {
    const { clientId, clientSecret, refreshToken, driveFolderName, filePath } = options;

    if (!clientId) throw new Error('Client id is required');
    if (!clientSecret) throw new Error('Client secret is required');
    if (!refreshToken) throw new Error('Refresh token is required');
    if (!driveFolderName) throw new Error('Drive folder name is required');
    if (!filePath) throw new Error('Filepath is required');

    const driveClient: drive_v3.Drive = createDriveClient(clientId, clientSecret, refreshToken);

    const driveFolder: drive_v3.Schema$File = await getDriveFolder(driveClient, driveFolderName);

    const uploadedFiles = await uploadFiles(driveClient, driveFolder, filePath);

    return uploadedFiles;
  }
}
