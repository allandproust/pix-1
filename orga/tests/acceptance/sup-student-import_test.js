import { module, test } from 'qunit';
import { find, triggerEvent, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createUserManagingStudents,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Sup Student Import', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When admin', function(hooks) {
    hooks.beforeEach(async function() {
      user = createUserManagingStudents('ADMIN', 'SUP');
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    module('And uploads a file', function() {
      test('it should display success message and reload students', async function(assert) {
        // given
        await visit('/etudiants/import');

        const file = new Blob(['foo'], { type: 'valid-file' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="success"]').hasText('La liste a été importée avec succès.');
        assert.dom('[aria-label="Étudiant"]').exists({ count: 1 });
        assert.contains('Cover');
        assert.contains('Harry');
      });

      test('it should display warnings message and reload students', async function(assert) {
        // given
        await visit('/etudiants/import');

        const file = new Blob(['foo'], { type: 'valid-file-with-warnings' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="warning"]').hasText('La liste a été importée avec succès.Cependant les valeurs suivantes n’ont pas été reconnues.Diplômes non reconnus : BAD; Elles ont été remplacées par “Non reconnu”. Si vous considérez qu’il manque des valeurs dans la liste limitative, veuillez nous contacter à sup@pix.fr');
        assert.dom('[aria-label="Étudiant"]').exists({ count: 1 });
        assert.contains('Cover');
        assert.contains('Harry');
      });

      test('it should display an error message when import failed', async function(assert) {
        // given
        await visit('/etudiants/import');

        const file = new Blob(['foo'], { type: 'invalid-file' });

        // when
        const input = find('#students-file-upload');
        await triggerEvent(input, 'change', { files: [file] });

        // then
        assert.dom('[data-test-notification-message="error"]').exists();
      });
    });
  });
});
