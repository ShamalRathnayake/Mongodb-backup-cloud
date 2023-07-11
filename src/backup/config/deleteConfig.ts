import typeConfig from './typeConfig';

const deleteConfig: Record<string, Record<string, any>> = {
  removeOldBackups: {
    type: typeConfig.types.boolean,
    key: 'removeOldBackups',
    default: false,
  },
  removeOldDir: {
    type: typeConfig.types.boolean,
    key: 'removeOldDir',
    default: false,
  },
  oldBackupPath: {
    type: typeConfig.types.string,
    key: 'oldBackupPath',
  },
  localBackupRange: {
    type: typeConfig.types.number,
    key: 'localBackupRange',
    default: 7,
  },
};

export default deleteConfig;
