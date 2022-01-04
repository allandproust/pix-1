const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../../../domain/models/Badge').keys;

const macaronCleaPath = `${__dirname}/files/macaron_clea.png`;
const macaronPixPlusDroitMaitrePath = `${__dirname}/files/macaron_maitre.png`;
const macaronPixPlusDroitExpertPath = `${__dirname}/files/macaron_expert.png`;
const macaronPixPlusEduAutonomePath = `${__dirname}/files/macaron_edu_autonome.png`;
const macaronPixPlusEduAvancePath = `${__dirname}/files/macaron_edu_avance.png`;
const macaronPixPlusEduExpertPath = `${__dirname}/files/macaron_edu_expert.png`;
const macaronPixPlusEduFormateurPath = `${__dirname}/files/macaron_edu_formateur.png`;

module.exports = function getImagePathByBadgeKey(badgeKey) {
  if ([PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(badgeKey)) {
    return macaronCleaPath;
  }
  if (badgeKey === PIX_DROIT_MAITRE_CERTIF) {
    return macaronPixPlusDroitMaitrePath;
  }
  if (badgeKey === PIX_DROIT_EXPERT_CERTIF) {
    return macaronPixPlusDroitExpertPath;
  }
  if (badgeKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME) {
    return macaronPixPlusEduAutonomePath;
  }
  if ([PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE].includes(badgeKey)) {
    return macaronPixPlusEduAvancePath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT) {
    return macaronPixPlusEduExpertPath;
  }
  if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR) {
    return macaronPixPlusEduFormateurPath;
  }
};