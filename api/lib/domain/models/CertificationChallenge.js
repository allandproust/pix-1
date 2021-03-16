class CertificationChallenge {
  constructor({
    id,
    associatedSkillName,
    associatedSkillId,
    challengeId,
    courseId,
    competenceId,
    isNeutralized,
  } = {}) {
    this.id = id;
    this.associatedSkillName = associatedSkillName;
    this.associatedSkillId = associatedSkillId;
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.courseId = courseId;
    this.isNeutralized = isNeutralized;
  }

  static new({
    associatedSkillName,
    associatedSkillId,
    challengeId,
    competenceId,
  }) {
    return new CertificationChallenge({
      id: undefined,
      courseId: undefined,
      associatedSkillName,
      associatedSkillId,
      challengeId,
      competenceId,
      isNeutralized: false,
    });
  }
}

module.exports = CertificationChallenge;
