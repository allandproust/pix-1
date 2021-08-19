const { expect, sinon, catchErr } = require('../../../test-helper');
const getUserProfileSharedForCampaign = require('../../../../lib/domain/usecases/get-user-profile-shared-for-campaign');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const { NoCampaignParticipationForUserAndCampaign } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-user-profile-shared-for-campaign', function() {

  const sharedAt = new Date('2020-02-01');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const userId = Symbol('user id');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const campaignId = Symbol('campaign id');
  const expectedCampaignParticipation = { id: '1', sharedAt };
  const locale = 'fr';

  let campaignParticipationRepository;
  let knowledgeElementRepository;
  let competenceRepository;
  let campaignRepository;

  context('When user has shared its profile for the campaign', function() {

    beforeEach(function() {
      campaignParticipationRepository = { findOneByCampaignIdAndUserId: sinon.stub() };
      knowledgeElementRepository = { findUniqByUserIdGroupedByCompetenceId: sinon.stub() };
      competenceRepository = { listPixCompetencesOnly: sinon.stub() };
      campaignRepository = { get: sinon.stub() };
      sinon.stub(Scorecard, 'buildFrom');
    });

    afterEach(function() {
      sinon.restore();
    });

    it('should return the shared profile for campaign', async function() {
      const knowledgeElements = { 'competence1': [], 'competence2': [] };
      const competences = [{ id: 'competence1' }, { id: 'competence2' }];
      const campaign = { multipleSendings: false };
      // given
      campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(expectedCampaignParticipation);
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.withArgs({ userId, limitDate: sharedAt }).resolves(knowledgeElements);
      competenceRepository.listPixCompetencesOnly.withArgs({ locale: 'fr' }).resolves(competences);
      campaignRepository.get.withArgs(campaignId).resolves(campaign);
      Scorecard
        .buildFrom
        .withArgs({ userId, knowledgeElements: knowledgeElements['competence1'], competence: competences[0] })
        .returns({ id: 'Score1', earnedPix: 10 });
      Scorecard
        .buildFrom
        .withArgs({ userId, knowledgeElements: knowledgeElements['competence2'], competence: competences[1] })
        .returns({ id: 'Score2', earnedPix: 5 });

      // when
      const sharedProfile = await getUserProfileSharedForCampaign({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeElementRepository,
        competenceRepository,
        campaignRepository,
        locale,
      });

      // then
      expect(sharedProfile).to.deep.equal({
        id: '1',
        sharedAt,
        pixScore: 15,
        canRetry: false,
        scorecards: [
          { id: 'Score1', earnedPix: 10 },
          { id: 'Score2', earnedPix: 5 },
        ],
      });
    });
  });

  context('When user has not shared its profile', function() {
    it('should throw an error', async function() {
      // given
      campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(null);

      // when
      const result = await catchErr(getUserProfileSharedForCampaign)({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeElementRepository,
        competenceRepository,
        campaignRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(NoCampaignParticipationForUserAndCampaign);
      expect(result.message).to.be.equal('L\'utilisateur n\'a pas encore participé à la campagne');
    });
  });
});
