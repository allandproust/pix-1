const faker = require('faker');
const get = require('lodash/get');
const isUndefined = require('lodash/isUndefined');

module.exports = {
  foundNextChallenge,
  handleResponseForChallengeId,
  setupSignupFormData,
};

function foundNextChallenge(context, next) {
  const continueLooping = !isUndefined(context.vars.challengeId);
  return next(continueLooping);
}

function handleResponseForChallengeId(requestParams, response, context, events, next) {
  context.vars.challengeId = get(response, 'body.data.id');
  return next();
}

function setupSignupFormData(context, events, done) {
  context.vars['firstName'] = faker.name.firstName();
  context.vars['lastName'] = faker.name.lastName();
  context.vars['email'] = `${faker.datatype.uuid().slice(19)}@example.net`;
  context.vars['password'] = 'Password123';
  return done();
}