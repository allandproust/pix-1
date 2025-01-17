import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import { keyUp } from 'ember-keyboard';

module('Unit | Component | app-modal', function (hooks) {
  setupTest(hooks);

  let modal;

  hooks.beforeEach(function () {
    modal = this.owner.lookup('component:app-modal');
  });

  module('#init', function () {
    test('should set the overlay as translucent', function (assert) {
      // then
      assert.true(modal.get('translucentOverlay'));
    });

    test('should activate keyboard events', function (assert) {
      // then
      assert.true(modal.get('keyboardActivated'));
    });
  });

  module('#closeOnEsc', function () {
    test('should use the "close" action', function (assert) {
      // Given
      const sendActionStub = sinon.stub();

      modal.onClose = sendActionStub;
      modal.trigger(keyUp('Escape'));

      // then
      assert.true(sendActionStub.calledOnce);
    });
  });
});
