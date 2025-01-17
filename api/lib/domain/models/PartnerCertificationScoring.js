const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const { NotImplementedError } = require('../errors');

class PartnerCertificationScoring {
  constructor({ complementaryCertificationCourseId, partnerKey, temporaryPartnerKey = null } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.partnerKey = partnerKey;
    this.temporaryPartnerKey = temporaryPartnerKey;
    const schema = Joi.object({
      complementaryCertificationCourseId: Joi.number().integer().required(),
      partnerKey: Joi.string().allow(null).required(),
      temporaryPartnerKey: Joi.string().allow(null).required(),
    });
    validateEntity(schema, this);
  }

  isAcquired() {
    throw new NotImplementedError();
  }
}

module.exports = PartnerCertificationScoring;
