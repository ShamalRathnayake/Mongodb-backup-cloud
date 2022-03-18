export type CommonOptions = {
  /**
   * Increases the amount of internal reporting returned on standard output or in log files. Increase the verbosity with the -v form by including the option multiple times, (e.g. -vvvvv.)
   */
  verbose?: 1 | 2 | 3 | 4 | 5;
  /**
     * Runs mongodump in a quiet mode that attempts to limit the amount of output.
     * This option suppresses:
        - output from database commands
        - replication activity
        - connection accepted events
        - connection closed events
     */
  quiet?: boolean;
  /**
   * Specifies the read preference for mongodump. 
   * The --readPreference option can take:
        - {readPreference: secondary}
        - {readPreference: '{mode: "secondary", tagSets:[ { "region": "east" } ], maxStalenessSeconds: 120}'}
   */
  readPreference?: string;
  /**
   * Compresses the output. If mongodump outputs to the dump directory, the new feature compresses the individual files. The files have the suffix .gz.
   */
  gzip?: boolean;
  /**
   * Specifies the directory where mongodump will write BSON files for the dumped databases.
   * - default - current_directory/dump
   *
   * You cannot use the *archive* option with the *outputPath* option.
   */
  outputPath?: string;
  archive?: string;
  archiveExtension?: string;
  schedule?: string;
  // eslint-disable-next-line no-unused-vars
  scheduleCallback?: (...args: any[]) => any;
  removeOldBackups?: boolean;
  removeOldDir?: boolean;
  oldBackupPath?: string;
  localBackupRange?: number;
  database?: string;
  collection?: string;
  query?: string;
  queryFilePath?: string;
  dumpUsersAndRoles?: boolean;
  excludeCollection?: Array<string>;
  excludeWithPrefix?: Array<string>;
  parallel?: number;
  viewsAsCollections?: boolean;
};

export type URIOptions = CommonOptions & {
  uri: string;
};

export type DirectOptions = CommonOptions & {
  host: string;
  port: string;
  username?: string;
  password?: string;
};

export type GithubOptions = {
  token: string;
  repository: string;
  branch: string;
  email: string;
  filePath: string;
  repoOwner?: string;
};

export type GDriveOptions = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  filePath: string;
  driveFolderName: string;
};

export type PartialDriveFile = {
  id: string;
  name: string;
};

export type SearchResultResponse = {
  kind: 'drive#fileList';
  nextPageToken: string;
  incompleteSearch: boolean;
  files: PartialDriveFile[];
};
