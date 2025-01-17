import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | certifications/issue-report', function (hooks) {
  setupRenderingTest(hooks);

  module('when the issue has not been resolved yet', function () {
    test('it should display resolve button', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
      this.set('issueReport', issueReport);

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}}/>`);

      // Then
      assert.dom(screen.getByRole('button', { name: 'Résoudre le signalement' })).exists();
    });
  });

  module('when the issue has already been resolved', function () {
    test('it should not display resolve button', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', {
        isImpactful: true,
        resolvedAt: new Date('2020-01-01'),
      });
      this.set('issueReport', issueReport);

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}}/>`);

      // Then
      assert.dom(screen.queryByText('Résoudre le signalement')).doesNotExist();
    });
  });
});
