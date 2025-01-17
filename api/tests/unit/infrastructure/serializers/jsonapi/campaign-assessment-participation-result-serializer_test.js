const { expect, domainBuilder } = require('../../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const CampaignParticipationStatuses = require('../../../../../lib/domain/models/CampaignParticipationStatuses');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');

const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-result-serializer', function () {
  describe('#serialize()', function () {
    let modelCampaignAssessmentParticipationResult;
    let expectedJsonApi;

    beforeEach(function () {
      const targetedCompetence = domainBuilder.buildTargetedCompetence({
        id: 'competence1',
        skills: ['oneSkill'],
        areaId: 'area1',
      });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'area1', competences: [targetedCompetence] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence],
        areas: [targetedArea],
      });
      expectedJsonApi = {
        data: {
          type: 'campaign-assessment-participation-results',
          id: '1',
          attributes: {
            'campaign-id': 2,
          },
          relationships: {
            'competence-results': {
              data: [
                {
                  id: `1-${targetedCompetence.id}`,
                  type: 'campaign-assessment-participation-competence-results',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'campaign-assessment-participation-competence-results',
            id: `1-${targetedCompetence.id}`,
            attributes: {
              name: targetedCompetence.name,
              index: targetedCompetence.index,
              'competence-mastery-rate': 1,
              'area-color': targetedArea.color,
            },
          },
        ],
      };

      modelCampaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        targetedCompetences: [targetedCompetence],
        campaignParticipationId: 1,
        campaignId: 2,
        targetProfile,
        validatedTargetedKnowledgeElementsCountByCompetenceId: { [targetedCompetence.id]: 1 },
        status: SHARED,
      });
    });

    it('should convert a CampaignAssessmentParticipationResult model object into JSON API data', function () {
      // when
      const json = serializer.serialize(modelCampaignAssessmentParticipationResult);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
