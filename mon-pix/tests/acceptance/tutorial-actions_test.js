import { click, find, visit } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Tutorial | Actions', function () {
  setupApplicationTest();
  setupMirage();
  let user;
  let firstScorecard;
  let competenceId;

  beforeEach(async function () {
    //given
    user = server.create('user', 'withEmail');
    firstScorecard = user.scorecards.models[0];
    competenceId = firstScorecard.competenceId;
    const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    server.create('challenge', 'forCompetenceEvaluation', 'QCM');
    server.create('competence-evaluation', { user, competenceId, assessment });

    // when
    await authenticateByEmail(user);
    await visit('/mes-tutos');
  });

  describe('Authenticated cases as simple user', function () {
    it('should display tutorial item in competence page with actions', async function () {
      // then
      expect(find('.tutorial-card-v2')).to.exist;
      expect(find('.tutorial-card-v2-content-actions__save')).to.exist;
      expect(find('.tutorial-card-v2-content-actions__evaluate')).to.exist;
    });

    it('should disable evaluate action on click', async function () {
      // when
      await click('.tutorial-card-v2-content-actions__evaluate');

      // then
      expect(find('.tutorial-card-v2-content-actions__evaluate').disabled).to.be.true;
    });

    describe('when save action is clicked', function () {
      it('should display remove action button', async function () {
        // when
        await click('.tutorial-card-v2-content-actions__save');

        // then
        expect(find('.tutorial-card-v2-content-actions__save').textContent).to.include('Retirer');
      });
    });
  });
});
