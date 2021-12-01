const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | tubes-controller', function () {
  let server;

  const learningContent = {
    tubes: [
      {
        id: 'tubeId',
        title: '@tube',
        description: 'Description tube',
        practicalTitleFrFr: 'Titre pratique',
        practicalDescriptionFrFr: 'description pratique',
        competenceId: 'recCOMP123',
      },
    ],
  };

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/framework/tubes', function () {
    describe('User is authenticated', function () {
      beforeEach(async function () {
        await databaseBuilder.factory.buildUser({
          id: 4444,
          firstName: 'Classic',
          lastName: 'Papa',
          email: 'classic.papa@example.net',
          password: 'abcd1234',
        });
        await databaseBuilder.commit();
        mockLearningContent(learningContent);
      });
      it('should return response code 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/framework/tubes`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(4444),
          },
        };

        const expectedResult = [
          {
            id: 'tubeId',
            type: 'tubes',
            attributes: {
              'practical-title': 'Titre pratique',
              'practical-description': 'description pratique',
              'competence-id': 'recCOMP123',
            },
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedResult);
      });
    });
    describe('User is not authenticated', function () {
      it('should return response code 401', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/framework/tubes`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
