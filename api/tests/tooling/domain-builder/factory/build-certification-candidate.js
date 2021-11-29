const buildComplementaryCertification = require('./build-complementary-certification');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

const buildCertificationCandidate = function ({
  id = 123,
  firstName = 'Poison',
  lastName = 'Ivy',
  sex = 'F',
  birthPostalCode = '75001',
  birthINSEECode = '75001',
  birthCity = 'Perpignan',
  birthProvinceCode = '66',
  birthCountry = 'France',
  email = 'poison.ivy@example.net',
  resultRecipientEmail = 'napoleon@example.net',
  birthdate = '1990-05-06',
  extraTimePercentage = 0.3,
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  authorizedToStart = false,
  sessionId = 456,
  userId = 789,
  schoolingRegistrationId,
  complementaryCertifications = [buildComplementaryCertification()],
} = {}) {
  return new CertificationCandidate({
    id,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
    authorizedToStart,
    userId,
    schoolingRegistrationId,
    complementaryCertifications,
  });
};

buildCertificationCandidate.notPersisted = function ({
  firstName = 'Poison',
  lastName = 'Ivy',
  sex = 'F',
  birthPostalCode = '75001',
  birthINSEECode = '75001',
  birthCity = 'Perpignan',
  birthProvinceCode = '66',
  birthCountry = 'France',
  email = 'poison.ivy@example.net',
  resultRecipientEmail = 'napoleon@example.net',
  birthdate = '1990-05-06',
  extraTimePercentage = 0.3,
  externalId = 'externalId',
  authorizedToStart = false,
  sessionId = 456,
}) {
  return new CertificationCandidate({
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    authorizedToStart,
  });
};

module.exports = buildCertificationCandidate;
