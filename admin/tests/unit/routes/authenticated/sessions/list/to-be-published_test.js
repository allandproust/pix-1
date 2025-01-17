import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list/to-be-published', function (hooks) {
  setupTest(hooks);

  let store;
  hooks.beforeEach(function () {
    class StoreStub extends Service {
      query = null;
    }
    this.owner.register('service:store', StoreStub);
    store = this.owner.lookup('service:store');
  });

  module('#model', function () {
    test('it should fetch the list of sessions to be published', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/sessions/list/to-be-published');
      const toBePublishedSessions = [
        {
          certificationCenterName: 'Centre SCO des Anne-Solo',
          finalizedAt: '2020-04-15T15:00:34.000Z',
        },
      ];
      const queryStub = sinon.stub();
      queryStub.withArgs('to-be-published-session', {}).resolves(toBePublishedSessions);
      store.query = queryStub;

      // when
      const result = await route.model();

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(result, toBePublishedSessions);
    });
  });
});
