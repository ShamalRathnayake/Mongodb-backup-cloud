import typeConfig from './typeConfig';

const scheduleConfig: Record<string, Record<string, any>> = {
  schedule: {
    type: typeConfig.types.string,
    key: 'schedule',
    option: '',
  },
  scheduleCallback: {
    type: typeConfig.types.function,
    key: 'scheduleCallback',
    option: '',
  },
};

export default scheduleConfig;
