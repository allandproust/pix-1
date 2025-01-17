const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const { MissingAssessmentId, AssessmentResultNotCreatedError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const { status: assessmentResultStatuses } = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Repository | AssessmentResult', function () {
  describe('#save', function () {
    let assessmentResultToSave;
    let assessmentResult;

    describe('when entries are corrects', function () {
      afterEach(function () {
        return knex('assessment-results').where('id', assessmentResult.id).delete();
      });

      beforeEach(async function () {
        const juryId = databaseBuilder.factory.buildUser().id;
        const assessmentId = databaseBuilder.factory.buildAssessment().id;
        assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId, assessmentId });
        assessmentResultToSave.id = undefined;
        await databaseBuilder.commit();
      });

      it('should persist the assessment result in db', async function () {
        // when
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        const assessmentResultSaved = await knex('assessment-results').where('id', assessmentResult.id);
        expect(assessmentResultSaved).to.have.lengthOf(1);
      });

      it('should save a cancelled assessment result', async function () {
        // when
        assessmentResultToSave.status = assessmentResultStatuses.CANCELLED;
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        const assessmentResultSaved = await knex('assessment-results').where('id', assessmentResult.id);
        expect(assessmentResultSaved).to.have.lengthOf(1);
      });

      it('should return the saved assessment result', async function () {
        // when
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        expect(assessmentResult).to.be.an.instanceOf(AssessmentResult);

        expect(assessmentResult).to.have.property('id').and.not.to.be.null;
      });
    });

    describe('when entries are incorrects', function () {
      beforeEach(async function () {
        const juryId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAssessment().id;
        assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId });
        await databaseBuilder.commit();
      });

      it('should throw a MissingAssessmentId error if assessmentId is null or undefined', async function () {
        // when
        assessmentResultToSave.assessmentId = null;
        const result = await catchErr(assessmentResultRepository.save)(assessmentResultToSave);

        // then
        expect(result).to.be.instanceOf(MissingAssessmentId);
      });

      it('should throw when assessment result status is invalid', async function () {
        // when
        const result = await catchErr(assessmentResultRepository.save)({ state: 'invalid status' });

        // then
        expect(result).to.be.instanceOf(Error);
      });

      it('should throw an error in others cases', async function () {
        // when
        const result = await catchErr(assessmentResultRepository.save)({ assessmentId: 1 });

        // then
        expect(result).to.be.instanceOf(AssessmentResultNotCreatedError);
      });
    });
  });

  describe('#findLatestLevelAndPixScoreByAssessmentId', function () {
    let assessmentWithResultsId;
    let assessmentWithoutResultsId;
    const expectedAssessmentResultLevel = 3;
    const expectedAssessmentResultPixScore = 10;
    const expectedAssessmentResultWithinLimitDateLevel = 4;
    const expectedAssessmentResultWithinLimitDatePixScore = 20;

    beforeEach(function () {
      assessmentWithResultsId = databaseBuilder.factory.buildAssessment().id;
      assessmentWithoutResultsId = databaseBuilder.factory.buildAssessment().id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentWithResultsId,
        createdAt: new Date('2019-02-01T00:00:00Z'),
        level: expectedAssessmentResultLevel,
        pixScore: expectedAssessmentResultPixScore,
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentWithResultsId,
        createdAt: new Date('2019-01-01T00:00:00Z'),
        level: expectedAssessmentResultWithinLimitDateLevel,
        pixScore: expectedAssessmentResultWithinLimitDatePixScore,
      }).id;

      return databaseBuilder.commit();
    });

    it('should return the most recent assessment result level and pixScore when assessment has some', async function () {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
        assessmentId: assessmentWithResultsId,
      });

      // then
      expect(level).to.equal(expectedAssessmentResultLevel);
      expect(pixScore).to.equal(expectedAssessmentResultPixScore);
    });

    it('should return the most recent assessment result level and pixScore within limit date when assessment has some', async function () {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
        assessmentId: assessmentWithResultsId,
        limitDate: new Date('2019-01-05T00:00:00Z'),
      });

      // then
      expect(level).to.equal(expectedAssessmentResultWithinLimitDateLevel);
      expect(pixScore).to.equal(expectedAssessmentResultWithinLimitDatePixScore);
    });

    it('should return null when assessment has no results', async function () {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
        assessmentId: assessmentWithoutResultsId,
      });

      // then
      expect(level).to.equal(0);
      expect(pixScore).to.equal(0);
    });
  });

  describe('#getByCertificationCourseId', function () {
    describe('when the given certification course id is correct', function () {
      it('should return assessment result', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        const juryId = databaseBuilder.factory.buildUser().id;
        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
        const assessmentResultDTO = {
          id: 123,
          pixScore: 500,
          status: AssessmentResult.status.VALIDATED,
          emitter: 'PIX_ALGO',
          commentForJury: 'Un commentaire pour le jury',
          commentForCandidate: 'Un commentaire pour le candidat',
          commentForOrganization: "Un commentaire pour l'organization",
          juryId,
          createdAt: new Date('2019-02-01T00:00:00Z'),
        };
        const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
          ...assessmentResultDTO,
          assessmentId,
        }).id;
        const competenceMark1 = databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });
        const competenceMark2 = databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });

        await databaseBuilder.commit();

        // when
        const result = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        const expectedAssessmentResult = {
          id: assessmentResultDTO.id,
          assessmentId,
          status: assessmentResultDTO.status,
          commentForCandidate: assessmentResultDTO.commentForCandidate,
          commentForOrganization: assessmentResultDTO.commentForOrganization,
          commentForJury: assessmentResultDTO.commentForJury,
          juryId: assessmentResultDTO.juryId,
          pixScore: assessmentResultDTO.pixScore,
          createdAt: assessmentResultDTO.createdAt,
          emitter: assessmentResultDTO.emitter,
          competenceMarks: [
            {
              id: competenceMark1.id,
              area_code: competenceMark1.area_code,
              competence_code: competenceMark1.competence_code,
              competenceId: competenceMark1.competenceId,
              level: competenceMark1.level,
              score: competenceMark1.score,
              assessmentResultId: competenceMark1.assessmentResultId,
            },
            {
              id: competenceMark2.id,
              area_code: competenceMark2.area_code,
              competence_code: competenceMark2.competence_code,
              competenceId: competenceMark2.competenceId,
              level: competenceMark2.level,
              score: competenceMark2.score,
              assessmentResultId: competenceMark2.assessmentResultId,
            },
          ],
        };
        expect(result).to.be.instanceOf(AssessmentResult);
        expect(result.competenceMarks[0]).to.be.instanceOf(CompetenceMark);
        expect(result).to.deep.equal(expectedAssessmentResult);
      });

      it('should return last assessment result', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;

        const pixScore = 600;
        const firstAssessementResultCreatedAt = new Date('2019-02-01T00:00:00Z');
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId,
          createdAt: firstAssessementResultCreatedAt,
          pixScore: 50,
        }).id;

        const secondAssessmentResultCreatedAt = new Date('2020-02-01T00:00:00Z');
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId,
          createdAt: secondAssessmentResultCreatedAt,
          pixScore,
        }).id;

        await databaseBuilder.commit();

        // when
        const result = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(result.pixScore).to.equal(pixScore);
      });
    });

    describe('when the given certification course id is incorrect', function () {
      describe('when no assessment was found', function () {
        it('should build an started assessment result', async function () {
          // given
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
          await databaseBuilder.commit();

          // when
          const result = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

          // then
          expect(result).to.be.instanceOf(AssessmentResult);
          expect(result.status).to.be.equal(Assessment.states.STARTED);
          expect(result.assessmentId).to.be.null;
        });
      });

      describe('when no assessment-result  was found', function () {
        it('should build an started assessment result', async function () {
          // given
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
          await databaseBuilder.commit();

          // when
          const result = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

          // then
          expect(result).to.be.instanceOf(AssessmentResult);
          expect(result.status).to.be.equal(Assessment.states.STARTED);
          expect(result.assessmentId).to.be.equal(assessmentId);
        });
      });
    });
  });
});
