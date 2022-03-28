import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/target-profiles/new-tube-based', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/target-profiles/new-tube-based');
  });

  module('#goBackToTargetProfileList', function () {
    test('should delete record and go back target profile list page', async function (assert) {
      controller.store.deleteRecord = sinon.stub();
      controller.transitionToRoute = sinon.stub();
      controller.model = { targetProfile: Symbol('targetProfile') };

      controller.goBackToTargetProfileList();

      assert.ok(controller.store.deleteRecord.calledWith(controller.model.targetProfile));
      assert.ok(controller.transitionToRoute.calledWith('authenticated.target-profiles.list'));
    });
  });

  module('#createTargetProfile', function () {
    test('it should save model', async function (assert) {
      controller.model = {
        targetProfile: {
          id: 3,
          save: sinon.stub(),
        },
      };

      controller.transitionToRoute = sinon.stub();

      controller.notifications = {
        success: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      controller.model.targetProfile.save.resolves();

      // when
      await controller.createTargetProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(controller.model.targetProfile.save.called);
      assert.ok(controller.notifications.success.calledWith('Le profil cible a été créé avec succès.'));
      assert.ok(
        controller.transitionToRoute.calledWith(
          'authenticated.target-profiles.target-profile',
          controller.model.targetProfile.id
        )
      );
    });

    test('it should display notification Error when model cannot be saved', async function (assert) {
      controller.model = {
        targetProfile: {
          save: sinon.stub(),
        },
      };

      controller.notifications = {
        error: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      controller.model.targetProfile.save.rejects();

      // when
      await controller.createTargetProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(controller.model.targetProfile.save.called);
      assert.ok(controller.notifications.error.calledWith('Une erreur est survenue.'));
    });
  });

  module('#frameworkOptions', function () {
    test('it should return a framework list as multiselect option data', async function (assert) {
      controller.frameworks = [
        { name: 'framework1', id: 'id1' },
        { name: 'framework2', id: 'id2' },
      ];

      // when
      const result = controller.frameworkOptions;

      assert.deepEqual(result, [
        { label: 'framework1', value: 'id1' },
        { label: 'framework2', value: 'id2' },
      ]);
    });
  });
});
