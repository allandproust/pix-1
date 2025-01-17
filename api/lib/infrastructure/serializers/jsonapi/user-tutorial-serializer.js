const { Serializer } = require('jsonapi-serializer');
const tutorial = require('./tutorial-attributes.js');
const UserSavedTutorial = require('../../../domain/models/UserSavedTutorial');

module.exports = {
  serialize(userTutorial) {
    return new Serializer('user-tutorial', {
      attributes: ['tutorial', 'userId', 'tutorialId', 'skillId', 'updatedAt'],
      tutorial,
    }).serialize(userTutorial);
  },

  deserialize(json) {
    return new UserSavedTutorial({
      id: json?.data.id,
      skillId: json?.data.attributes['skill-id'],
    });
  },
};
