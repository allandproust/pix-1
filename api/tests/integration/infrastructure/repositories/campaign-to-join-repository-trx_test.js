const { expect, databaseBuilder, domainBuilder, catchErr, mockLearningContent, knex } = require('../../../test-helper');
const CampaignToJoinRepository = require('../../../../lib/infrastructure/repositories/campaign-to-join-repository-trx');
const CampaignToJoin = require('../../../../lib/domain/read-models/CampaignToJoin');
const { NotFoundError, ForbiddenAccess, AlreadyExistingCampaignParticipationError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CampaignToJoin', function() {

  let campaignToJoinRepository;
  beforeEach(function() {
    campaignToJoinRepository = new CampaignToJoinRepository(knex);
  });
  describe('#get', function() {

    it('should return the CampaignToJoin', async function() {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization();
      const expectedCampaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id, targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      const actualCampaign = await campaignToJoinRepository.get(expectedCampaign.id);

      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
      expect(actualCampaign.code).to.deep.equal(expectedCampaign.code);
      expect(actualCampaign.title).to.deep.equal(expectedCampaign.title);
      expect(actualCampaign.idPixLabel).to.deep.equal(expectedCampaign.idPixLabel);
      expect(actualCampaign.customLandingPageText).to.deep.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.deep.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.deep.equal(expectedCampaign.alternativeTextToExternalIdHelpImage);
      expect(actualCampaign.archivedAt).to.deep.equal(expectedCampaign.archivedAt);
      expect(actualCampaign.type).to.deep.equal(expectedCampaign.type);
      expect(actualCampaign.organizationId).to.deep.equal(organization.id);
      expect(actualCampaign.organizationName).to.deep.equal(organization.name);
      expect(actualCampaign.organizationType).to.deep.equal(organization.type);
      expect(actualCampaign.organizationLogoUrl).to.deep.equal(organization.logoUrl);
      expect(actualCampaign.isRestricted).to.deep.equal(organization.isManagingStudents);
      expect(actualCampaign.targetProfileName).to.deep.equal(targetProfile.name);
      expect(actualCampaign.targetProfileImageUrl).to.deep.equal(targetProfile.imageUrl);
    });

    it('should throw a NotFoundError when no campaign exists with given id', async function() {
      // given
      const existingId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.get, campaignToJoinRepository)(existingId + 1000);

      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#checkCampaignIsJoinableByUser', function() {
    let targetProfileId;
    const skills = [
      { id: 'skill1', status: 'actif' },
      { id: 'skill2', status: 'archivé' },
      { id: 'skill3', status: 'périmé' },
      { id: 'skill4', status: 'actif' },
    ];

    beforeEach(function() {
      mockLearningContent({ skills });
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill3' });
    });

    it('should not throw an error when the campaign is not archived and not restricted and the user has no participation for the given campaign', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign();
      const campaignToJoin = domainBuilder.buildCampaignToJoin(campaignData);
      await databaseBuilder.commit();

      // when
      try {
        campaignToJoinRepository.checkCampaignIsJoinableByUser(campaignToJoin, userId);
      } catch (error) {
        expect.fail(`"${error}" should not have been thrown`);
      }
    });

    it('should throw an error if the campaign is archived', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ archivedAt: new Date('2020-01-01') });
      const campaignToJoin = domainBuilder.buildCampaignToJoin(campaignData);
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.checkCampaignIsJoinableByUser, campaignToJoinRepository)(campaignToJoin, userId);

      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('Vous n\'êtes pas autorisé à rejoindre la campagne');
    });

    it('should throw an error if the campaign is restricted and the user does not have a corresponding schooling registration', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId });
      const campaignData = databaseBuilder.factory.buildCampaign({ organizationId });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
        organizationIsManagingStudents: true,
      });
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.checkCampaignIsJoinableByUser, campaignToJoinRepository)(campaignToJoin, userId);

      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('Vous n\'êtes pas autorisé à rejoindre la campagne');
    });

    it('should not throw error when the campaign is restricted and the user has a corresponding schooling registration', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId });
      const campaignData = databaseBuilder.factory.buildCampaign({ organizationId });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
        organizationIsManagingStudents: true,
      });
      await databaseBuilder.commit();

      try {
        await campaignToJoinRepository.checkCampaignIsJoinableByUser(campaignToJoin, userId);
      } catch (error) {
        expect.fail(`"${error}" should not have been thrown`);
      }
    });

    it('should throw an error when campaign is not multipleSendings and there is already a participation for user', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ multipleSendings: false });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
      });
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.checkCampaignIsJoinableByUser, campaignToJoinRepository)(campaignToJoin, userId);

      expect(error).to.be.instanceOf(AlreadyExistingCampaignParticipationError);
      expect(error.message).to.equal(`User ${userId} has already a campaign participation with campaign ${campaignData.id}`);
    });

    it('should not throw error when campaign is multipleSendings and there is already a participation shared for user', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ multipleSendings: true });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id, isShared: true, sharedAt: new Date('2020-01-01') });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
      });
      await databaseBuilder.commit();

      // when
      try {
        await campaignToJoinRepository.checkCampaignIsJoinableByUser(campaignToJoin, userId);
      } catch (error) {
        expect.fail(`"${error}" should not have been thrown`);
      }
    });

    it('should throw error when campaign is multipleSendings and there is already a participation which is not shared for user', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ multipleSendings: true });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id, isShared: false, sharedAt: null });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
      });
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.checkCampaignIsJoinableByUser, campaignToJoinRepository)(campaignToJoin, userId);

      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('Vous ne pouvez pas repasser la campagne');
    });

    it('should throw error when campaign is multipleSendings and there is at least one participation which is not shared for user', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ multipleSendings: true });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id, isShared: true, sharedAt: new Date('2020-01-01'), isImproved: true });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id, isShared: false, sharedAt: null, isImproved: false, validatedSkillsCount: 2 });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
      });
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.checkCampaignIsJoinableByUser, campaignToJoinRepository)(campaignToJoin, userId);

      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('Vous ne pouvez pas repasser la campagne');
    });

    it('should throw error when campaign is multipleSendings and there is participation which is shared for user but the mastery percentage is 100%', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ multipleSendings: true, targetProfileId });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id, isShared: true, sharedAt: new Date('2020-01-01'), isImproved: true, validatedSkillsCount: 1 });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id, isShared: true, sharedAt: new Date('2020-01-01'), isImproved: false, validatedSkillsCount: 2 });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
      });
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.checkCampaignIsJoinableByUser, campaignToJoinRepository)(campaignToJoin, userId);

      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('Vous ne pouvez pas repasser la campagne');
    });

    it('should throw error when campaign is multipleSendings and there is participation which is shared for user but the mastery percentage is over 100%', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ multipleSendings: true, targetProfileId });
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaignData.id, isShared: true, sharedAt: new Date('2020-01-01'), isImproved: false, validatedSkillsCount: 3 });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
      });
      await databaseBuilder.commit();

      const error = await catchErr(campaignToJoinRepository.checkCampaignIsJoinableByUser, campaignToJoinRepository)(campaignToJoin, userId);

      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('Vous ne pouvez pas repasser la campagne');
    });

  });

  describe('#getByCode', function() {

    it('should return the CampaignToJoin by its code', async function() {
      // given
      const code = 'LAURA123';
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization();
      const expectedCampaign = databaseBuilder.factory.buildCampaign({ code, organizationId: organization.id, targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode(code);

      // then
      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
      expect(actualCampaign.code).to.deep.equal(expectedCampaign.code);
      expect(actualCampaign.title).to.deep.equal(expectedCampaign.title);
      expect(actualCampaign.idPixLabel).to.deep.equal(expectedCampaign.idPixLabel);
      expect(actualCampaign.customLandingPageText).to.deep.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.deep.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.deep.equal(expectedCampaign.alternativeTextToExternalIdHelpImage);
      expect(actualCampaign.archivedAt).to.deep.equal(expectedCampaign.archivedAt);
      expect(actualCampaign.type).to.deep.equal(expectedCampaign.type);
      expect(actualCampaign.organizationId).to.deep.equal(organization.id);
      expect(actualCampaign.organizationName).to.deep.equal(organization.name);
      expect(actualCampaign.organizationType).to.deep.equal(organization.type);
      expect(actualCampaign.organizationLogoUrl).to.deep.equal(organization.logoUrl);
      expect(actualCampaign.isRestricted).to.deep.equal(organization.isManagingStudents);
      expect(actualCampaign.targetProfileName).to.deep.equal(targetProfile.name);
      expect(actualCampaign.targetProfileImageUrl).to.deep.equal(targetProfile.imageUrl);
      expect(actualCampaign.isSimplifiedAccess).to.deep.equal(targetProfile.isSimplifiedAccess);
    });

    context('when the organization of the campaign has the POLE EMPLOI tag', function() {
      it('should return true for organizationIsPoleEmploi', async function() {
        // given
        const code = 'LAURA456';
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildCampaign({ code, organizationId: organization.id });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: organization.id,
          tagId: databaseBuilder.factory.buildTag({ name: 'POLE EMPLOI' }).id,
        });
        await databaseBuilder.commit();

        // when
        const actualCampaign = await campaignToJoinRepository.getByCode(code);

        // then
        expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
        expect(actualCampaign.organizationIsPoleEmploi).to.be.true;
      });
    });

    context('when the organization of the campaign does not have the POLE EMPLOI tag', function() {
      it('should return false for organizationIsPoleEmploi', async function() {
        // given
        const code = 'LAURA456';
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildCampaign({ code, organizationId: organization.id });
        await databaseBuilder.commit();

        // when
        const actualCampaign = await campaignToJoinRepository.getByCode(code);

        // then
        expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
        expect(actualCampaign.organizationIsPoleEmploi).to.be.false;
      });
    });

    it('should throw a NotFoundError when no campaign exists with given code', async function() {
      // given
      const code = 'LAURA123';
      databaseBuilder.factory.buildCampaign({ code });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(campaignToJoinRepository.getByCode, campaignToJoinRepository)('LAURA456');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
