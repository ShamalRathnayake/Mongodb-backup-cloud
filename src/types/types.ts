export type CommonOptions = {
  /**
   * Increases the amount of logging output
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
   * - default - current_directory/backup
   *
   * You cannot use the *archive* option with the *outputPath* option.
   */
  outputPath?: string;
  /**
   * Writes the output to a specified archive file.
   *
   * You cannot use the *archive* option with the *outputPath* option.
   */
  archive?: string;
  /**
   * File extension of the archive file.
   *
   * Must be used with *archive* option
   */
  archiveExtension?: string;
  /**
   * Backup mongodb instance using a cron schedule.
   *  - cron syntax string
   */
  schedule?: string;
  /**
   * Callback function to run after every scheduled backup process completion
   * - returns output object
   */
  // eslint-disable-next-line no-unused-vars
  scheduleCallback?: (...args: any[]) => any;
  /**
   * Remove previous backups
   *  - default - false
   */
  removeOldBackups?: boolean;
  /**
   * Remove entire directory containing previous backups
   */
  removeOldDir?: boolean;
  /**
   * Relative path to the previous backup that should be removed
   */
  oldBackupPath?: string;
  /**
   * Number of days to keep previous backups.
   * backups made before the specified number of days will be removed
   * - default - 7days
   */
  localBackupRange?: number;
  /**
   * Specifies a database to backup. If you do not specify a database, mongodump copies all databases of the instance into the dump files.
   */
  database?: string;
  /**
   * Specifies a collection to backup. If you do not specify a collection, this option copies all collections in the specified database or instance to the dump files.
   */
  collection?: string;
  /**
   * Provides a JSON document as a query that optionally limits the documents included in the output of mongodump. To use the query option, you must also specify the collection option.
   *
   * You must enclose the query document in single quotes ('{ ... }')
   */
  query?: string;
  /**
   * Specifies the path to a file containing a JSON document as a query filter that limits the documents included in the output of mongodump.
   */
  queryFilePath?: string;
  /**
   * Includes user and role definitions in the database's dump directory when performing mongodump on a specific database. This option applies only when you specify a database in the database option.
   */
  dumpUsersAndRoles?: boolean;
  /**
   * Excludes the specified collections from the mongodump output.
   * - example :-  ['coll_1', 'coll_2']
   */
  excludeCollection?: Array<string>;
  /**
   * Excludes all collections with a specified prefix from the mongodump outputs.
   *  - example :-  ['coll', 'test']
   */
  excludeWithPrefix?: Array<string>;
  /**
   * Number of collections mongodump should export in parallel.
   */
  parallel?: number;
  /**
   * When specified, mongodump exports read-only views as collections.
   */
  viewsAsCollections?: boolean;
};

export type URIOptions = CommonOptions & {
  /**
   * Mongodb connection string
   */
  uri: string;
};

export type DirectOptions = CommonOptions & {
  /**
   * Specifies the resolvable hostname of the MongoDB deployment.
   */
  host: string;
  /**
   * Specifies the TCP port on which the MongoDB instance listens for client connections.
   */
  port: string;
  /**
   * Specifies a username with which to authenticate to a MongoDB database that uses authentication.
   */
  username?: string;
  /**
   * Specifies a password with which to authenticate to a MongoDB database that uses authentication.
   */
  password?: string;
  /**
   * Specifies the authentication database where the specified username has been created.
   */
  authenticationDatabase?: string;
};

export type GithubOptions = {
  /**
   * Github private access token
   */
  token: string;
  /**
   * Github repository name
   */
  repository: string;
  /**
   * Github repository branch name
   */
  branch: string;
  /**
   * Github account email
   */
  email: string;
  /**
   * Path to file or directory that needs to be added to github
   */
  filePath: string;
  /**
   * Repo owner Github Username
   */
  repoOwner?: string;
};

export type GDriveOptions = {
  /**
   * oAuth client id
   */
  clientId: string;
  /**
   * oAuth client secret
   */
  clientSecret: string;
  /**
   * oAuth refresh token
   */
  refreshToken: string;
  /**
   * Path to the file or directory that needs to be uploaded
   */
  filePath: string;
  /**
   * Google drive root level folder name
   * - folder will be created if it doesn't exist
   */
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
