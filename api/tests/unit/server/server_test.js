const { expect } = require('../../test-helper');

const createServer = require('../../../server');

describe('Unit | Server | server', function() {

  describe('#createServer', function() {

    it('should create server with custom validate.failAction', async function() {
      // given
      const expectedFailActionFunctionName = 'handleFailAction';

      // when
      const server = await createServer();

      // then
      expect(server.settings.routes.validate.failAction.name).to.equal(expectedFailActionFunctionName);
    });

  });

});
