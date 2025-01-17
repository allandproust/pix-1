const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(usersAnonymizedDetailsForAdmin) {
    return new Serializer('user', {
      attributes: [
        'firstName',
        'lastName',
        'email',
        'username',
        'cgu',
        'pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted',
        'authenticationMethods',
      ],
      authenticationMethods: {
        ref: 'id',
        includes: true,
        attributes: ['identityProvider'],
      },
    }).serialize(usersAnonymizedDetailsForAdmin);
  },
};
