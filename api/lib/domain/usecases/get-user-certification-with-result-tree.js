const { UserNotAuthorizedToAccessEntity } = require('../errors');
const ResultCompetenceTree = require('../models/ResultCompetenceTree');

async function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentResultRepository }) {
  const latestAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId: certificationId });
  return [
    latestAssessmentResult.id,
    latestAssessmentResult.competenceMarks,
  ];
}

async function getCertificationResult({
  getCertification,
  isAuthorized,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository
}) {
  const certification = await getCertification();
  if (!isAuthorized(certification)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certification.id);
  certification.cleaCertificationStatus = cleaCertificationStatus;

  const competenceTree = await competenceTreeRepository.get();
  const [assessmentResultId, competenceMarks] = await _getsCompetenceMarksAndAssessmentResultId({ certificationId: certification.id, assessmentResultRepository });

  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks,
  });
  resultCompetenceTree.id = `${certification.id}-${assessmentResultId}`;

  certification.resultCompetenceTree = resultCompetenceTree;

  return certification;
}

module.exports = async function getUserCertificationWithResultTree({
  certificationId,
  userId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const getCertification = async () => certificationRepository.getByCertificationCourseId({ id: certificationId });
  const isAuthorized = (certification) => certification.userId === userId;

  return getCertificationResult({
    getCertification,
    isAuthorized,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
