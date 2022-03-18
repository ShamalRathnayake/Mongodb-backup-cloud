import 'jest';
import { extendedOptionString, generateOptionString } from '../functions';

describe('Option string generation', () => {
  test('verbose option', () => {
    expect(
      generateOptionString({
        verbose: 3,
      })
    ).toBe(' -vvv');
  });

  test('quiet option', () => {
    expect(
      generateOptionString({
        quiet: true,
      })
    ).toBe(' --quiet');
  });

  test('read preferences option', () => {
    expect(
      generateOptionString({
        readPreference: 'secondary',
      })
    ).toBe(' --readPreference=secondary');

    expect(
      generateOptionString({
        readPreference: `{ mode: 'secondary', tagSets: [{ region: 'east' }], maxStalenessSeconds: 120 }`,
      })
    ).toBe(` --readPreference={ mode: 'secondary', tagSets: [{ region: 'east' }], maxStalenessSeconds: 120 }`);
  });

  test('gZip option', () => {
    expect(
      generateOptionString({
        gzip: true,
      })
    ).toBe(' --gzip');
  });

  test('database option', () => {
    expect(
      generateOptionString({
        database: 'test_database',
      })
    ).toBe(' --db=test_database');
  });

  test('collection option', () => {
    expect(
      generateOptionString({
        collection: 'test_collection',
      })
    ).toBe(' --collection=test_collection');
  });

  test('query option', () => {
    expect(() =>
      generateOptionString({
        query: 'test_query',
      })
    ).toThrow('Collection option is required to use query option');

    expect(
      generateOptionString({
        collection: 'test_collection',
        query: 'test_query',
      })
    ).toBe(' --collection=test_collection --query=test_query');
  });

  test('queryFilePath option', () => {
    expect(
      generateOptionString({
        queryFilePath: 'test_query_filepath',
      })
    ).toBe(' --queryFile=test_query_filepath');
  });

  test('dumpDbUsersAndRoles option', () => {
    expect(
      generateOptionString({
        dumpUsersAndRoles: true,
      })
    ).toBe(' --dumpDbUsersAndRoles');
  });

  test('parallel option', () => {
    expect(
      generateOptionString({
        parallel: 1,
      })
    ).toBe(' -j=1');
  });

  test('viewsAsCollections option', () => {
    expect(
      generateOptionString({
        viewsAsCollections: true,
      })
    ).toBe(' --viewsAsCollections');
  });

  test('excludeCollections option', () => {
    expect(
      generateOptionString({
        excludeCollection: ['testCollection1', 'testCollection2'],
      })
    ).toBe(' --excludeCollection=testCollection1 --excludeCollection=testCollection2');
  });

  test('excludeWithPrefix option', () => {
    expect(
      generateOptionString({
        excludeWithPrefix: ['test', '2'],
      })
    ).toBe(' --excludeCollectionsWithPrefix=test --excludeCollectionsWithPrefix=2');
  });

  test('some options', () => {
    expect(
      generateOptionString({
        verbose: 3,
        quiet: true,
        readPreference: 'secondary',
        gzip: true,
        database: 'test_db',
        collection: 'test_collection',
        query: 'test_query',
      })
    ).toBe(
      ' --quiet --readPreference=secondary --gzip --db=test_db --collection=test_collection --query=test_query -vvv'
    );
  });
});

describe('Extended option string', () => {
  test('Host option', () => {
    expect(() =>
      extendedOptionString({
        host: '',
        port: '2131',
      })
    ).toThrow('Host is required');

    expect(
      extendedOptionString({
        host: 'localhost',
        port: '2131',
      })
    ).toBe('--host=localhost --port=2131');

    expect(
      extendedOptionString({
        host: 'http://127.0.0.1',
        port: '2131',
      })
    ).toBe('--host=http://127.0.0.1 --port=2131');
  });

  test('Port option', () => {
    expect(() =>
      extendedOptionString({
        host: 'localhost',
        port: '',
      })
    ).toThrow('Port is required');

    expect(
      extendedOptionString({
        host: 'localhost',
        port: '2131',
      })
    ).toBe('--host=localhost --port=2131');
  });

  test('Username option', () => {
    expect(
      extendedOptionString({
        host: 'localhost',
        port: '2131',
        username: 'test_user',
      })
    ).toBe('--host=localhost --port=2131 --username=test_user');
  });

  test('Password option', () => {
    expect(
      extendedOptionString({
        host: 'localhost',
        port: '2131',
        password: 'test',
      })
    ).toBe('--host=localhost --port=2131 --password=test');
  });

  test('Multiple options', () => {
    expect(
      extendedOptionString({
        host: 'localhost',
        port: '2131',
        username: 'user',
        password: 'test',
        database: 'test_db',
        gzip: true,
        verbose: 4,
      })
    ).toBe('--host=localhost --port=2131 --username=user --password=test --gzip --db=test_db -vvvv');
  });
});
