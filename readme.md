# Mongodb-backup-cloud

>  Automate mongodb instance backup & upload to Github / GDrive
>  
#### What can this package do?

- Backup **Mongodb** database instances 
- Upload backup files to **Github**
- Upload backup files to **Google Drive**

## Note

- Backup process can be executed once or repeatedly using cron schedules
- In order for the backup process to work the computer running the code must have **Mongodb Database Tools** installed and added to **Path**  
[How to install Mongodb Database Tools](https://docs.mongodb.com/database-tools/installation/installation/)

----
### usage

Backup Process
```js
import {Backup, DirectOptions, URIOptions } from  "mongodb-backup-cloud";

// Backup with mongodb connection string
-----------------------------------------------

const uriOptions: URIOptions = {
  uri: "mongodb://localhost:27017/",
  database: 'test_db',
  collection: 'test_collection',
  outputPath: './test_backup_path',
};

Backup.withConnectionString(uriOptions);


// Backup with host & port
-----------------------------------------------
  
const directOptions: DirectOptions = {
  host: "localhost",
  port: "27017",
  database: "test_db",
  collection: "test_collection",
  outputPath: "./test_backup_path",
};

Backup.withHostAndPort(directOptions);


// Backup + Delete old backup files
----------------------------------------------

const uriOptions: URIOptions = {
  uri: "mongodb://localhost:27017/",
  database: "test_db",
  collection: "test_collection",
  outputPath: "./test_backup_path",
  removeOldBackups: true,
  oldBackupPath: "./old_backup",
};

Backup.withConnectionString(uriOptions);


// Run backup with cron schedule
---------------------------------------------

const scheduleOptions: DirectOptions = {
  host: "localhost",
  port: "27017",
  database: "test_db",
  collection: "test_collection",
  outputPath: "./test_backup_path",
  schedule: '00 00 00 * * *',
  scheduleCallback: (args) => { /* do something */ },
};

Backup.withHostAndPort(scheduleOptions);


// Backup + Delete old backups with cron schedule
--------------------------------------------------
  
const scheduleOptions: DirectOptions = {
  host: "localhost",
  port: "27017",
  database: "test_db",
  collection: "test_collection",
  outputPath: "./test_backup_path",
  schedule: "00 00 00 * * *",
  scheduleCallback: (args) => {/* do something */ },
  removeOldBackups: true,
  localBackupRange: 2,
};

Backup.withHostAndPort(scheduleOptions);
```
----

Upload Process

```js
import {Upload, GDriveOptions, GithubOptions,} from  "mongodb-backup-cloud";

// Upload files to github

const githubOptions: GithubOptions = {
  token: 'private access token', // with repo and read:user access to read repo names
  repository: 'test_repo',
  branch: 'main',
  email: 'your github email',
  filePath: './backups'
}

Upload.toGitHub(githubOptions);


// Upload files to Google Drive

const driveOptions: GDriveOptions = {
  clientId: 'oAuth client id',
  clientSecret: 'oAuth client secret',
  refreshToken: 'oAuth refresh token',
  driveFolderName: 'test_upload',
  filePath: './backups'
}

Upload.toGoogleDrive(driveOptions);
```

[How to get OAuth Credentials](https://blog.tericcabrel.com/upload-file-to-google-drive-with-nodejs/)

---

#### Available Options

> Backup
 
| option             | type          | default                  | description                                                                                                                                                               |
| ------------------ | ------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| uri                | string        | ---                      | Mongodb connection string                                                                                                                                                 |
| host               | string        | ---                      | Specifies the resolvable hostname of the MongoDB deployment.                                                                                                              |
| port               | string        | ---                      | Specifies the TCP port on which the MongoDB instance listens for client connections.                                                                                      |
| username           | string        | ---                      | Specifies a username with which to authenticate to a MongoDB database that uses authentication.                                                                           |
| password           | string        | ---                      | Specifies a password with which to authenticate to a MongoDB database that uses authentication.                                                                           |
| verbose            | number (1-5)  | 1                        | Increases the amount of logging output                                                                                                                                    |
| quiet              | boolean       | false                    | Limits the amount of output                                                                                                                                               |
| readPreference     | object        | primary                  | Specifies the read preference for mongodump                                                                                                                               |
| gzip               | boolean       | false                    | Compresses the output. The files have the suffix ' .gz '                                                                                                                  |
| outputPath         | string        | current_directory/backup | Specifies the directory where mongodump will write BSON files for the dumped databases.                                                                                   |
| archive            | string        | ---                      | Writes the output to a specified archive file.                                                                                                                            |
| archiveExtension   | string        | ---                      | File extension of the archive file.                                                                                                                                       |
| schedule           | string        | ---                      | cron schedule string. ex:- '0 0 * * * *'                                                                                                                                  |
| scheduleCallback   | function      | ---                      | Callback function to run after every scheduled backup process completion                                                                                                  |
| removeOldBackups   | boolean       | false                    | Remove previous backups                                                                                                                                                   |
| removeOldDir       | boolean       | false                    | Remove entire directory containing previous backups                                                                                                                       |
| oldBackupPath      | string        | ---                      | Relative path to the previous backup that should be removed <br />** useful only when NOT using the schedule option**                                                     |
| localBackupRange   | number        | 7                        | Number of days to keep previous backups. Backups made before the specified number of days will be removed <br /> ** available only when using the schedule option**       |
| database           | string        | ---                      | Specifies a database to backup. If you do not specify a database, mongodump copies all databases of the instance into the dump files.                                     |
| collection         | string        | ---                      | Specifies a collection to backup. If you do not specify a collection, this option copies all collections in the specified database or instance to the dump files.         |
| query              | string        | ---                      | Provides a JSON document as a query that optionally limits the documents included in the output of mongodump. <br /> ** available only when using the collection option** |
| queryFilePath      | string        | ---                      | Specifies the path to a file containing a JSON document as a query filter that limits the documents included in the output of mongodump.                                  |
| dumpUsersAndRoles  | boolean       | false                    | Includes user and role definitions in the database's dump directory <br /> ** available only when using the database option**                                             |
| excludeCollection  | Array[string] | ---                      | Excludes the specified collections from the mongodump output <br/> example :- ['coll_1', 'coll_2']                                                                        |
| excludeWithPrefix  | Array[string] | ---                      | Excludes all collections with a specified prefix from the mongodump outputs. <br/> example :- ['coll', 'test']                                                            |
| parallel           | number        | ---                      | Number of collections mongodump should export in parallel.                                                                                                                |
| viewsAsCollections | boolean       | ---                      | When specified, mongodump exports read-only views as collections.                                                                                                         |
---

> Upload

- Github

| option     | type   | default | description                                                |
| ---------- | ------ | ------- | ---------------------------------------------------------- |
| token      | string | ---     | Github private access token                                |
| repository | string | ---     | Github repository name                                     |
| branch     | string | ---     | Github repository branch name                              |
| email      | string | ---     | Github account email                                       |
| filePath   | string | ---     | Path to file or directory that needs to be added to github |

---

- Google Drive


| option          | type   | default | description                                                                     |
| --------------- | ------ | ------- | ------------------------------------------------------------------------------- |
| clientId        | string | ---     | OAuth client id                                                                 |
| clientSecret    | string | ---     | OAuth client secret                                                             |
| refreshToken    | string | ---     | OAuth refresh token                                                             |
| filePath        | string | ---     | Path to the file or directory that needs to be uploaded                         |
| driveFolderName | string | ---     | Google drive root level folder name. folder will be created if it doesn't exist |

---




