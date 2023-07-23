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
   *
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

/* ---------------------------------------------------------------------------- */

export type BackupOptions = {
  /**
   * Increase the verbosity of the output.
   *
   * Use 1 through 5 to increase the verbosity level.
   * - Example: 2
   */
  verbose?: number;

  /**
   * Specifies the full path to a YAML configuration file containing sensitive values for the following options to mongodump:

  -  --password

  -  --uri

  -  --sslPEMKeyPassword
   *
   * Using these options individually as option fields is not necessary when using config option
   * 
   * the YAML file structure should be similar to following :-
   * 
   * - password: \<password>
   * - uri: mongodb://mongodb0.example.com:27017
   * - sslPEMKeyPassword: \<password>
   */
  config?: string;

  /**
   * Suppress all non-error messages.
   * - Example: true
   */
  quiet?: boolean;

  /**
   * MongoDB server host to connect to.
   * - Example: "localhost"
   */
  host: string;

  /**
   * MongoDB server port to connect to.
   * - Example: 27017
   */
  port: number;

  /**
   * Use SSL/TLS for the connection.
   * - Example: true
   */
  ssl?: boolean;

  /**
   * Specifies the .pem file containing the root certificate chain from the certificate authority.
   * - Example: "/path/to/ca.pem"
   */
  sslCAFile?: string;

  /**
   * Specifies the .pem file containing the client certificate or public key and private key used for authentication, if required by the server.
   * - Example: "/path/to/client.pem"
   */
  sslPEMKeyFile?: string;

  /**
   * Specifies the password to decrypt the private key in the SSL certificate specified by sslPEMKeyFile.
   * - Example: "password"
   */
  sslPEMKeyPassword?: string;

  /**
   * Specifies the .pem file containing the certificate revocation list.
   * - Example: "/path/to/crl.pem"
   */
  sslCRLFile?: string;

  /**
   * Allows connections to servers with self-signed certificates or certificates that are not properly signed by a certificate authority.
   * - Example: true
   */
  sslAllowInvalidCertificates?: boolean;

  /**
   * Allows connections to servers whose hostname does not match the name specified by the sslPEMKeyFile or the host parameter.
   * - Example: true
   */
  sslAllowInvalidHostnames?: boolean;

  /**
   * Specifies the username for authentication.
   * - Example: "admin"
   */
  username?: string;

  /**
   * Specifies the password for authentication.
   * - Example: "password123"
   */
  password?: string;

  /**
   * Specifies the session token for authentication with MongoDB Atlas.
   * - Example: "abcdefg"
   */
  awsSessionToken?: string;

  /**
   * Specifies the authentication database.
   * - Example: "admin"
   */
  authenticationDatabase?: string;

  /**
   * Specifies the authentication mechanism to use.
   * - Example: "SCRAM-SHA-256"
   */
  authenticationMechanism?: string;

  /**
   * Specifies the GSSAPI service name.
   * - Example: "mongod"
   */
  gssapiServiceName?: string;

  /**
   * Specifies the GSSAPI host name.
   * - Example: "mongodb.example.com"
   */
  gssapiHostName?: string;

  /**
   * Specifies the database name.
   * - Example: "mydatabase"
   */
  db?: string;

  /**
   * Specifies the collection name.
   * - Example: "mycollection"
   */
  collection?: string;

  /**
   * Specifies a query filter in MongoDB Extended JSON format.
   * - Example: '{"name": "John"}'
   */
  query?: string;

  /**
   * Specifies the path to a file containing a query filter in MongoDB Extended JSON format.
   * - Example: "/path/to/query.json"
   */
  queryFile?: string;

  /**
   * Specifies the read preference for the MongoDB query.
   * - Example: "secondary"
   */
  readPreference?: string;

  /**
   * Compresses the output data using GZIP compression.
   * - Example: true
   */
  gzip?: boolean;

  /**
   * Dumps the oplog for point-in-time restores.
   * - Example: true
   */
  oplog?: boolean;

  /**
   * Dumps user and role definitions for the specified database.
   * - Example: true
   */
  dumpDbUsersAndRoles?: boolean;

  /**
   * Excludes the specified collection from the dump operation.
   * - Example: ["collection1", "collection2"]
   */
  excludeCollection?: string[];

  /**
   * Excludes collections with the specified prefix from the dump operation.
   * - Example: ["prefix1", "prefix2"]
   */
  excludeCollectionsWithPrefix?: string[];

  /**
   * Specifies the number of collections to dump in parallel. Default is 4.
   * - Example: 8
   */
  numParallelCollections?: number;

  /**
   * Treats views as collections and includes them in the dump operation.
   * - Example: true
   */
  viewsAsCollections?: boolean;

  /**
   * Specifies the output directory or file.
   * - Example: "/path/to/output"
   */
  out?: string;

  /**
   * Creates a single archive file of the dumped data.
   * - Example: "/path/to/archive"
   */
  archive?: string;

  /**
   * File extension of the archive file.
   *
   * Must be used with *archive* option
   * - Example: '.zip'
   */
  archiveExtension?: string;

  /**
   * Backup mongodb instance using a cron schedule.
   * cron syntax string
   * - Example: "* * 00 * * *"
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
   *  - default - false
   */
  removeOldDir?: boolean;

  /**
   * (**OPTIONAL -Use only if old backups are in a different directory from your backup directory)
   *
   * Relative path to the previous backup that should be removed
   *
   * can be used with removeOldDir to remove entire folder
   */
  oldBackupPath?: string;

  /**
   * Number of days to keep previous backups.
   *
   * backups made before the specified number of days will be removed
   * - default - 7days
   */
  localBackupRange?: number;
};

export type StringArray = Array<string>;

export type PathOptions = {
  parentDirectory: string;
  backupPath: string;
  backupDirectory: string;
  oldBackupPath: string;
  oldBackupDirectory: string;
};
