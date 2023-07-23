import typeConfig from './typeConfig';

const backupConfig: Record<string, Record<string, any>> = {
  verbose: {
    type: typeConfig.types.number,
    option: 'v',
  },
  config: {
    type: typeConfig.types.string,
    option: '--config',
  },
  quiet: {
    type: typeConfig.types.boolean,
    option: '--quiet',
  },
  host: {
    type: typeConfig.types.string,
    option: '--host',
  },
  port: {
    type: typeConfig.types.number,
    option: '--port',
  },
  ssl: {
    type: typeConfig.types.boolean,
    option: '--ssl',
  },
  sslCAFile: {
    type: typeConfig.types.string,
    option: '--sslCAFile',
  },
  sslPEMKeyFile: {
    type: typeConfig.types.string,
    option: '--sslPEMKeyFile',
  },
  sslPEMKeyPassword: {
    type: typeConfig.types.string,
    option: '--sslPEMKeyPassword',
  },
  sslCRLFile: {
    type: typeConfig.types.string,
    option: '--sslCRLFile',
  },
  sslAllowInvalidCertificates: {
    type: typeConfig.types.boolean,
    option: '--sslAllowInvalidCertificates',
  },
  sslAllowInvalidHostnames: {
    type: typeConfig.types.boolean,
    option: '--sslAllowInvalidHostnames',
  },
  username: {
    type: typeConfig.types.string,
    option: '--username',
  },
  password: {
    type: typeConfig.types.string,
    option: '--password',
  },
  awsSessionToken: {
    type: typeConfig.types.string,
    option: '--awsSessionToken',
  },
  authenticationDatabase: {
    type: typeConfig.types.string,
    option: '--authenticationDatabase',
  },
  authenticationMechanism: {
    type: typeConfig.types.string,
    option: '--authenticationMechanism',
  },
  gssapiServiceName: {
    type: typeConfig.types.string,
    option: '--gssapiServiceName',
  },
  gssapiHostName: {
    type: typeConfig.types.string,
    option: '--gssapiHostName',
  },
  db: {
    type: typeConfig.types.string,
    option: '--db',
  },
  collection: {
    type: typeConfig.types.string,
    option: '--collection',
  },
  query: {
    type: typeConfig.types.string,
    option: '--query',
  },
  queryFile: {
    type: typeConfig.types.string,
    option: '--queryFile',
  },
  readPreference: {
    type: typeConfig.types.string,
    option: '--readPreference',
  },
  gzip: {
    type: typeConfig.types.boolean,
    option: '--gzip',
  },
  oplog: {
    type: typeConfig.types.boolean,
    option: '--oplog',
  },
  dumpDbUsersAndRoles: {
    type: typeConfig.types.boolean,
    option: '--dumpDbUsersAndRoles',
  },
  excludeCollection: {
    type: typeConfig.types.array,
    option: '--excludeCollection',
  },
  excludeCollectionsWithPrefix: {
    type: typeConfig.types.array,
    option: '--excludeCollectionsWithPrefix',
  },
  numParallelCollections: {
    type: typeConfig.types.number,
    option: '--numParallelCollections',
  },
  viewsAsCollections: {
    type: typeConfig.types.boolean,
    option: '--viewsAsCollections',
  },
};

export default backupConfig;
