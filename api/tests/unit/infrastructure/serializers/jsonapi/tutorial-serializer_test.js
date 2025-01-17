const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer');

describe('Unit | Serializer | JSONAPI | tutorial-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const tutorialId = 123;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Savoir regarder des vidéos youtube.',
          },
        },
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
    it('should return a serialized JSON data object, enhanced by tube information', function () {
      // given
      const tutorialId = 123;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });
      tutorial.tubeName = '@web';
      tutorial.tubePracticalTitle = 'Tube Practical Title';
      tutorial.tubePracticalDescription = 'Tube Practical Description';

      tutorial.unknownAttribute = 'should not be in result';

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Savoir regarder des vidéos youtube.',
            'tube-name': '@web',
            'tube-practical-description': 'Tube Practical Description',
            'tube-practical-title': 'Tube Practical Title',
          },
        },
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });

    it('should return a serialized JSON data object, with userSavedTutorial related to', function () {
      // given
      const userId = 456;
      const tutorialId = 123;
      const tutorialEvaluationId = `${userId}_${tutorialId}`;
      const userTutorialId = `${userId}_${tutorialId}`;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });
      tutorial.tutorialEvaluation = { userId, id: tutorialEvaluationId, tutorialId };
      tutorial.userTutorial = { userId, id: userTutorialId, tutorialId };

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Savoir regarder des vidéos youtube.',
          },
          relationships: {
            'tutorial-evaluation': {
              data: {
                id: tutorialEvaluationId,
                type: 'tutorialEvaluation',
              },
            },
            'user-tutorial': {
              data: {
                id: userTutorialId,
                type: 'user-tutorial',
              },
            },
          },
        },
        included: [
          {
            attributes: {
              id: tutorialEvaluationId,
              'user-id': userId,
              'tutorial-id': tutorialId,
            },
            id: tutorialEvaluationId,
            type: 'tutorialEvaluation',
          },
          {
            attributes: {
              id: userTutorialId,
              'user-id': userId,
              'tutorial-id': tutorialId,
            },
            id: userTutorialId,
            type: 'user-tutorial',
          },
        ],
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });

    it('should return a serialized JSON data object with pagination', function () {
      // given
      const tutorialId = 123;

      const tutorials = [
        domainBuilder.buildTutorial({
          id: tutorialId,
        }),
      ];
      const pagination = {
        page: 1,
        pageSize: 10,
        rowCount: 1,
        pageCount: 1,
      };

      const expectedSerializedResult = {
        data: [
          {
            id: tutorialId.toString(),
            type: 'tutorials',
            attributes: {
              duration: '00:01:30',
              format: 'video',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Savoir regarder des vidéos youtube.',
            },
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          rowCount: 1,
          pageCount: 1,
        },
      };

      // when
      const result = serializer.serialize(tutorials, pagination);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
