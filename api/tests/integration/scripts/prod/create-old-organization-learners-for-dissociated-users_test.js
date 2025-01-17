const { expect, databaseBuilder, knex } = require('../../../test-helper');
const createOldOrganizationLearnersForDissociatedUsers = require('../../../../scripts/prod/create-old-organization-learners-for-dissociated-users.js');
const pick = require('lodash/pick');

describe('Integration | Scripts | create-old-organization-learners-for-dissociated-users', function () {
  afterEach(async function () {
    await knex('campaign-participations').delete();
    await knex('organization-learners').delete();
  });

  describe('#createOldOrganizationLearnersForDissociatedUsers', function () {
    it('should create a new organizationLearner with disabled status', async function () {
      const user = databaseBuilder.factory.buildUser({ firstName: 'Henri', lastName: 'Golo' });
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(2);
      const organizationLearnersToCheck = organizationLearners.map((organizationLearner) =>
        pick(organizationLearner, ['userId', 'firstName', 'lastName', 'organizationId', 'isDisabled'])
      );
      expect(organizationLearnersToCheck).to.deep.include.members([
        {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: campaign.organizationId,
          isDisabled: true,
        },
      ]);
    });

    it('should create a new organizationLearner for both old participations', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign1 = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign1.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        organizationLearnerId,
        createdAt: new Date(),
      });

      const campaign2 = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign2.id,
        organizationLearnerId: organizationLearnerId2,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        organizationLearnerId: organizationLearnerId2,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(4);
    });

    it('should create a new organizationLearner for old campaign participation only', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const oldCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const [organizationLearner] = await knex('organization-learners').whereNot({ id: organizationLearnerId });
      const [updatedCampaignParticipation] = await knex('campaign-participations').where({
        id: oldCampaignParticipation.id,
      });

      //then
      expect(updatedCampaignParticipation.organizationLearnerId).to.equal(organizationLearner.id);
    });

    it('should not update with new organizationLearnerId all participations', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      const recentCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const [campaignParticipation] = await knex('campaign-participations').where({
        id: recentCampaignParticipation.id,
      });

      //then
      expect(campaignParticipation.organizationLearnerId).to.equal(recentCampaignParticipation.organizationLearnerId);
    });

    it('should not create organizationLearner if old participation is improved', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
        isImproved: true,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(1);
    });

    it('should not create organizationLearner if new participation is improved', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date(),
        isImproved: true,
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(1);
    });

    it('should not create organizationLearner if old participation is deleted', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
        deletedAt: new Date(),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(1);
    });

    it('should not create organizationLearner if new participation is deleted', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        createdAt: new Date(),
        deletedAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(1);
    });

    it('should not create organizationLearner if both participations have already their own', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId: organizationLearnerId1,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: organizationLearnerId2,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(2);
    });

    it('should not create organizationLearner if participations are in different campaigns', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaignId1 = databaseBuilder.factory.buildCampaign().id;
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaignId1,
        organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaignId2,
        organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(1);
    });
  });
});
