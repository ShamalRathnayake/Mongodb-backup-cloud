import { Backup } from './src/index';

const backupOptions = {
  verbose: 2,
  // config: './backup/path/to/config.yaml',
  /* quiet: true, */
  host: 'localhost',
  port: 27017,
  /* ssl: true,
  sslCAFile: '/path/to/ca.pem',
  sslPEMKeyFile: '/path/to/client.pem',
  sslPEMKeyPassword: 'password',
  sslCRLFile: '/path/to/crl.pem',
  sslAllowInvalidCertificates: true,
  sslAllowInvalidHostnames: true,
  username: 'admin',
  password: 'password123',
  awsSessionToken: 'abcdefg',
  authenticationDatabase: 'admin',
  authenticationMechanism: 'SCRAM-SHA-256',
  gssapiServiceName: 'mongod',
  gssapiHostName: 'mongodb.example.com', */
  db: 'test',
  /* collection: 'mycollection',
  query: '{"name": "John"}',
  queryFile: '/path/to/query.json',
  readPreference: 'secondary', */
  gzip: true,
  /* oplog: true,
  dumpDbUsersAndRoles: true,
  excludeCollection: ['collection1', 'collection2'],
  excludeCollectionsWithPrefix: ['prefix1', 'prefix2'],
  numParallelCollections: 8,
  viewsAsCollections: true, */
  out: './backup',
  // archive: './backup',
  /* archiveExtension: '.zip', */
  schedule: '* * 00 * * *',
  // scheduleCallback: (...args) => {
  // Your schedule callback function logic here
  // },
  removeOldBackups: true,
  removeOldDir: false,
  // oldBackupPath: '/path/to/old/backup',
  localBackupRange: 7,
};

const backup = new Backup(backupOptions, true);
backup.handleBackupProcess();
console.log('🚀 ~ file: check.ts:49 ~ backup:', backup);
