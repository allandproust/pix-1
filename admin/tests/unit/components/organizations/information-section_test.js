import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';

module('Unit | Component | organizations/information-section', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:organizations/information-section');
  });

  test('it should generate link based on environment and object', async function (assert) {
    // given
    const args = { organization: { id: 1 } };
    const baseURL = 'https://metabase.pix.fr/dashboard/137/?id=';
    const expectedURL = baseURL + args.organization.id;

    ENV.APP.ORGANIZATION_DASHBOARD_URL = baseURL;
    component.args = args;

    // when
    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(component.externalURL, expectedURL);
  });
});
