import { percentage } from 'pix-orga/helpers/percentage';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | percentage', function (hooks) {
  setupTest(hooks);

  module('percentage', () => {
    test('it multiply by 100 the given value', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(percentage([1]), 100);
    });

    test('it rounds the given value with one digit', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(percentage([0.088]), 8.8);
    });
  });
});
