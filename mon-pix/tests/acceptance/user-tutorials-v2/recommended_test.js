import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, findAll, find, click } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Recommended', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
  });

  describe('When there are recommended tutorials', () => {
    it('should display paginated tutorial cards', async function () {
      // given
      server.createList('tutorial', 100);

      // when
      await visit('/mes-tutos-v2/recommandes');

      //then
      expect(findAll('.tutorial-card-v2')).to.exist;
      expect(findAll('.tutorial-card-v2')).to.be.lengthOf(10);
      expect(find('.pix-pagination__navigation').textContent).to.contain('Page 1 / 10');
    });

    describe('when a tutorial is saved', function () {
      it('should not remove it from the list when clicking on the remove button', async function () {
        // given
        server.createList('tutorial', 1, 'withUserTutorial');
        await visit('/mes-tutos-v2/recommandes');

        // when
        await click(find('.tutorial-card-v2-content-actions__save'));

        // then
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(1);
      });
    });
  });
});
