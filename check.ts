import { Backup } from './src/index';

const backup = new Backup(
  {
    host: '127.0.0.1',
    port: 27017,
    db: 'test',
    excludeCollection: ['aaaaa', 'bbbbbbb', 'cccccc'],
    verbose: 5,
  },
  true
);
backup.print();
