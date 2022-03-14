const { sinon, expect, hFake } = require('../../../test-helper');
const userTutorialsController = require('../../../../lib/application/user-tutorials/user-tutorials-controller');
const usecases = require('../../../../lib/domain/usecases');
const userTutorialSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-tutorial-serializer');
const userTutorialRepository = require('../../../../lib/infrastructure/repositories/user-tutorial-repository');

describe('Unit | Controller | User-tutorials', function () {
  describe('#add', function () {
    it('should call the expected usecase', async function () {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      sinon.stub(usecases, 'addTutorialToUser').returns({ id: 'userTutorialId' });
      sinon.stub(userTutorialSerializer, 'deserialize').returns({});

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId },
      };

      // when
      await userTutorialsController.add(request, hFake);

      // then
      const addTutorialToUserArgs = usecases.addTutorialToUser.firstCall.args[0];
      expect(addTutorialToUserArgs).to.have.property('userId', userId);
      expect(addTutorialToUserArgs).to.have.property('tutorialId', tutorialId);
    });

    describe('when skill id is given', function () {
      it('should call the expected usecase', async function () {
        // given
        const skillId = 'skillId';
        const tutorialId = 'tutorialId';
        const userId = 'userId';
        sinon.stub(usecases, 'addTutorialToUser').returns({ id: 'userTutorialId' });
        sinon.stub(userTutorialSerializer, 'deserialize').returns({ skillId });

        const request = {
          auth: { credentials: { userId } },
          params: { tutorialId },
          payload: { data: { attributes: { 'skill-id': 'skillId' } } },
        };

        // when
        await userTutorialsController.add(request, hFake);

        // then
        const addTutorialToUserArgs = usecases.addTutorialToUser.firstCall.args[0];
        expect(addTutorialToUserArgs).to.have.property('userId', userId);
        expect(addTutorialToUserArgs).to.have.property('tutorialId', tutorialId);
        expect(addTutorialToUserArgs).to.have.property('skillId', skillId);
        expect(userTutorialSerializer.deserialize).to.have.been.calledWith(request.payload);
      });
    });
  });

  describe('#find', function () {
    it('should call the expected usecase', async function () {
      // given
      const userId = 'userId';
      sinon.stub(usecases, 'findUserTutorials').returns([]);

      const request = {
        auth: { credentials: { userId } },
      };

      // when
      await userTutorialsController.find(request, hFake);

      // then
      const findUserTutorialsArgs = usecases.findUserTutorials.firstCall.args[0];
      expect(findUserTutorialsArgs).to.have.property('userId', userId);
    });
  });

  describe('#findRecommended', function () {
    it('should call the expected usecase', async function () {
      // given
      const userId = 'userId';
      sinon.stub(usecases, 'findPaginatedRecommendedTutorials').returns([]);

      const request = {
        auth: { credentials: { userId } },
      };

      // when
      await userTutorialsController.findRecommended(request, hFake);

      // then
      const findPaginatedRecommendedTutorialsArgs = usecases.findPaginatedRecommendedTutorials.firstCall.args[0];
      expect(findPaginatedRecommendedTutorialsArgs).to.have.property('userId', userId);
    });
  });

  describe('#findSaved', function () {
    it('should call the expected usecase', async function () {
      // given
      const userId = 'userId';
      sinon.stub(usecases, 'findSavedTutorials').returns([]);

      const request = {
        auth: { credentials: { userId } },
      };

      // when
      await userTutorialsController.findSaved(request, hFake);

      // then
      const findSavedTutorialsArgs = usecases.findSavedTutorials.firstCall.args[0];
      expect(findSavedTutorialsArgs).to.have.property('userId', userId);
    });
  });

  describe('#removeFromUser', function () {
    it('should call the repository', async function () {
      // given
      const userId = 'userId';
      const tutorialId = 'tutorialId';
      sinon.stub(userTutorialRepository, 'removeFromUser');

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId },
      };

      // when
      await userTutorialsController.removeFromUser(request, hFake);

      // then
      const removeFromUserArgs = userTutorialRepository.removeFromUser.firstCall.args[0];
      expect(removeFromUserArgs).to.have.property('userId', userId);
      expect(removeFromUserArgs).to.have.property('tutorialId', tutorialId);
    });
  });
});
