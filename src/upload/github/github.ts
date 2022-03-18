import { Octokit } from '@octokit/rest';
const { retry } = require('@octokit/plugin-retry');
const MyOctokit = Octokit.plugin(retry);
import fs from 'fs';
import path from 'path';
const globby = require('globby');

export const init = (token: string) => {
  const octokit: Octokit = new MyOctokit({
    auth: token.trim(),
    throttle: {
      onRateLimit: (retryAfter: any, options: { method: any; url: any; request: { retryCount: number } }) => {
        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

        if (options.request.retryCount === 0) {
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onAbuseLimit: (retryAfter: any, options: { method: any; url: any }) => {
        octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`);
      },
    },
    log: console,
  });

  return octokit;
};

export const getAuthUser = async (octokit: Octokit) => {
  const { data: user } = await octokit.rest.users.getAuthenticated();
  return user;
};

export const getRepository = async (octokit: Octokit, owner: string, repoName: string) => {
  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();

  if (repos && !repos.map((repo: any) => repo.name).includes(repoName)) {
    await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      auto_init: true,
      private: true,
    });
  }

  const { data: repository } = await octokit.rest.repos.get({
    owner,
    repo: repoName,
  });

  return repository;
};

export const getBranch = async (octokit: Octokit, username: string, repository: string, branchName: string) => {
  const { data: branches } = await octokit.rest.repos.listBranches({
    owner: username,
    repo: repository,
  });

  if (!branches.map((branch: any) => branch.name).includes(branchName)) {
    await octokit.rest.git.createRef({
      owner: username,
      repo: repository,
      ref: `refs/heads/${branchName}`,
      sha: branches[0].commit.sha,
    });
  }

  const { data: branch } = await octokit.rest.repos.getBranch({
    owner: username,
    repo: repository,
    branch: branchName,
  });

  return branch;
};

export const getLatestCommit = async (octokit: Octokit, username: string, repository: string, branch: string) => {
  const { data: ref } = await octokit.git.getRef({
    owner: username,
    repo: repository,
    ref: `heads/${branch}`,
  });

  const commitSha = ref.object.sha;

  const { data: commitData } = await octokit.git.getCommit({
    owner: username,
    repo: repository,
    commit_sha: commitSha,
  });

  return {
    commitSha,
    treeSha: commitData.tree.sha,
  };
};

export const filesToBlobs = async (octokit: Octokit, username: string, repository: string, filePath: string) => {
  if (!fs.existsSync(filePath)) throw new Error('File path does not exist');
  const isDirectory = fs.lstatSync(filePath).isDirectory();
  if (!isDirectory) {
    const blobData = await createBlob(octokit, username, repository, filePath);
    return [blobData];
  } else {
    let globPath = path.posix.join(path.relative(process.cwd(), filePath), '**');
    if (process.platform === 'win32') globPath = globPath.replace(/\\/g, '/');
    const paths = await globby(globPath);

    const allBlobData = await Promise.all(
      paths.map(async (filePath: string) => {
        const blobData = await createBlob(octokit, username, repository, filePath);
        return blobData;
      })
    );

    return allBlobData;
  }
};

const createBlob = async (octokit: Octokit, username: string, repository: string, filePath: string) => {
  const fullPath = path.resolve(__dirname, path.relative(__dirname, filePath));
  const relativePath = path.relative(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, { encoding: 'base64' });
  const { data: blobData } = await octokit.git.createBlob({
    owner: username,
    repo: repository,
    content: fileContent,
    encoding: 'base64',
  });
  return { relativePath, blobData };
};

export const createTree = async (
  octokit: Octokit,
  username: string,
  repository: string,
  fileBlobs: {
    relativePath: string;
    blobData: {
      url: string;
      sha: string;
    };
  }[],
  treeSha: string
) => {
  const tree: any[] = fileBlobs.map((blob) => ({
    path: process.platform === 'win32' ? blob.relativePath.replace(/\\/g, '/') : blob.relativePath,
    mode: '100644',
    type: 'blob',
    sha: blob.blobData.sha,
  }));

  const { data: treeData } = await octokit.rest.git.createTree({
    owner: username,
    repo: repository,
    tree,
    base_tree: treeSha,
  });

  return treeData;
};

export const createCommit = async (
  octokit: Octokit,
  username: string,
  email: string,
  repository: string,
  treeSha: string,
  commitSha: string
) => {
  const { data: commit } = await octokit.rest.git.createCommit({
    owner: username,
    repo: repository,
    message: 'Backup Updated',
    tree: treeSha,
    'author.name': username,
    'author.email': email,
    parents: [commitSha],
  });

  return commit;
};

export const updateRef = async (
  octokit: Octokit,
  username: string,
  repository: string,
  branch: string,
  commitSha: string
) => {
  const { data: update } = await octokit.git.updateRef({
    owner: username,
    repo: repository,
    ref: `heads/${branch}`,
    sha: commitSha,
  });
  return update;
};
