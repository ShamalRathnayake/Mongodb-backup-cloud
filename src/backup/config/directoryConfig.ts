import typeConfig from './typeConfig';

const directoryConfig: Record<string, Record<string, any>> = {
  out: {
    type: typeConfig.types.string,
    key: 'out',
    option: '--out',
  },
  archive: {
    type: typeConfig.types.string,
    key: 'archive',
    option: '--archive',
  },
  archiveExtension: {
    type: typeConfig.types.string,
    key: 'archiveExtension',
    option: '',
  },
};

export default directoryConfig;
