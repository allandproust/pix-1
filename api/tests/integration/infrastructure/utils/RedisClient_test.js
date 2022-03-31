const RedisClient = require('../../../../lib/infrastructure/utils/RedisClient');
const { expect } = require('../../../test-helper');
const { promisify } = require('util');
const config = require('../../../../lib/config');
const redis = require('redis');
const redisUrl = config.caching.redisUrl;

describe('Integration | Infrastructure | Utils | RedisClient', function () {
  let redisClient;
  let client;
  let get, set;

  beforeEach(function () {
    redisClient = new RedisClient(redisUrl, 'redis-test');
    client = redis.createClient(redisUrl, { database: 1 });
    get = promisify(client.get).bind(client);
    set = promisify(client.set).bind(client);
  });

  afterEach(function () {
    client.flushall();
  });

  describe('#get', function () {
    it('stores and retrieve a value for a key', async function () {
      // given
      const key = new Date().toISOString();

      // when
      await redisClient.set(key, 'value');
      const value = await redisClient.get(key);

      // then
      expect(value).to.equal('value');
    });
  });

  describe('#del', function () {
    it('should delete a value', async function () {
      // given
      await redisClient.set('foo', 'bar');

      // when
      await redisClient.del('foo');

      // then
      const notFound = await get('foo');
      expect(notFound).to.be.null;
    });

    context('with prefix', function () {
      it('should delete a value with prefix', async function () {
        // given
        const value = new Date().toISOString();
        const redisClientWithPrefix = new RedisClient(redisUrl, { prefix: 'client-prefix:' });
        await redisClientWithPrefix.set('AVRIL', value);

        // when
        await redisClientWithPrefix.del('AVRIL');

        // then
        const notFound = await get('client-prefix:AVRIL');
        expect(notFound).to.be.null;
      });

      it('should allow delete a value without prefix', async function () {
        // given
        const value = new Date().toISOString();
        const redisClientWithPrefix = new RedisClient(redisUrl, { prefix: 'client-prefix:' });
        await set('key', value);

        // when
        await redisClientWithPrefix.del('storage-prefix:key');

        // then
        expect(await redisClientWithPrefix.get('storage-prefix:key')).to.be.null;
        await redisClientWithPrefix.del('storage-prefix:key');
      });
    });
  });

  describe('#set', function () {
    it('should store value', async function () {
      // when
      const result = await redisClient.set('foo', 'bar');

      // then
      expect(result).to.be.equal('OK');
      const savedValue = await get('foo');
      expect(savedValue).to.be.equal('bar');
    });

    describe('with prefix', function () {
      it('should separate storage for identical keys saved with different prefixes', async function () {
        // given
        const redisClient1 = new RedisClient(redisUrl, { prefix: 'test1' });
        const redisClient2 = new RedisClient(redisUrl, { prefix: 'test2' });
        await redisClient1.set('key', 'value1');
        await redisClient2.set('key', 'value2');

        // when / then
        expect(await redisClient1.get('key')).to.equal('value1');
        expect(await redisClient2.get('key')).to.equal('value2');
        await redisClient1.del('key');
        await redisClient2.del('key');
      });

      it('should allow retrieve without prefix a value with a prefix', async function () {
        // given
        const value = new Date().toISOString();
        const redisClientWithoutPrefix = new RedisClient(redisUrl);
        const redisClientWithPrefix = new RedisClient(redisUrl, { prefix: 'client-prefix:' });
        await redisClientWithoutPrefix.set('key', value);

        // when / then
        expect(await redisClientWithPrefix.get('storage-prefix:key')).to.equal(value);
        await redisClientWithPrefix.del('storage-prefix:key');
      });
    });
  });

  describe('#ping', function () {
    it('should be wrap to be promisify', async function () {
      // when
      const result = await redisClient.ping();

      // then
      expect(result).to.be.equal('PONG');
    });
  });

  describe('#flushall', function () {
    it('should be wrap to be promisify', async function () {
      // when
      const result = await redisClient.flushall();

      // then
      expect(result).to.be.equal('OK');
    });
  });

  describe('#lockDisposer', function () {});
});
