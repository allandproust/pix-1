const { expect } = require('../../../test-helper');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Unit | Repository | target-profile-repository', function() {

  describe('#get', function() {

    it('should return the easy profile whatever the id parameter', function() {
      // given
      const expectedProfile = new TargetProfile({
        skills: [
          new Skill({ name: '@composantsMatériels1' }),
          new Skill({ name: '@composantsMatériels2' }),
          new Skill({ name: '@fiche technique2' }),
          new Skill({ name: '@fiche technique3' }),
          new Skill({ name: '@connectique2' }),
          new Skill({ name: '@connectique3' }),
          new Skill({ name: '@problèmeClavier2' }),
          new Skill({ name: '@problèmeClavier3' }),
          new Skill({ name: '@appliOS1' }),
          new Skill({ name: '@recherche1' }),
          new Skill({ name: '@recherche2' }),
          new Skill({ name: '@environnementTravail1' }),
          new Skill({ name: '@environnementTravail2' }),
          new Skill({ name: '@outilsTexte1' }),
          new Skill({ name: '@outilsTexte2' }),
          new Skill({ name: '@saisiePratique1' }),
          new Skill({ name: '@saisiePratique2' }),
          new Skill({ name: '@saisiePratique3' }),
          new Skill({ name: '@copierColler1' }),
          new Skill({ name: '@copierColler2' }),
          new Skill({ name: '@miseEnFormeTttTxt1' }),
          new Skill({ name: '@miseEnFormeTttTxt2' }),
          new Skill({ name: '@miseEnFormeTttTxt3' }),
          new Skill({ name: '@miseEnFormeTexte1' }),
          new Skill({ name: '@miseEnFormeTexte2' }),
          new Skill({ name: '@miseEnFormeTexte3' }),
          new Skill({ name: '@form_intero2' }),
          new Skill({ name: '@form_intero3' }),
          new Skill({ name: '@remplir1' }),
          new Skill({ name: '@remplir3' }),
          new Skill({ name: '@tri1' }),
          new Skill({ name: '@tri3' }),
          new Skill({ name: '@champsCourriel1' }),
          new Skill({ name: '@champsCourriel2' }),
          new Skill({ name: '@champsCourriel3' }),
          new Skill({ name: '@Moteur1' }),
          new Skill({ name: '@rechinfo1' }),
          new Skill({ name: '@rechinfo3' }),
          new Skill({ name: '@utiliserserv1' }),
          new Skill({ name: '@utiliserserv2' }),
          new Skill({ name: '@utiliserserv3' }),
          new Skill({ name: '@eval2' }),
          new Skill({ name: '@eval3' }),
          new Skill({ name: '@eval4' }),
          new Skill({ name: '@fonctionnementTwitter2' }),
          new Skill({ name: '@fonctionnementTwitter3' }),
          new Skill({ name: '@fonctionnementTwitter4' }),
          new Skill({ name: '@outilsRS1' }),
          new Skill({ name: '@outilsRS2' }),
          new Skill({ name: '@outilsRS3' }),
          new Skill({ name: '@outilsMsgélectronique1' }),
          new Skill({ name: '@outilsMsgélectronique3' }),
          new Skill({ name: '@outilsMessagerie2' }),
          new Skill({ name: '@outilsMessagerie3' }),
          new Skill({ name: '@PJ2' }),
          new Skill({ name: '@agendaPartage2' }),
          new Skill({ name: '@outilscollaboratifs3' }),
          new Skill({ name: '@outilscollaboratifs4' }),
          new Skill({ name: '@editerDocEnLigne1' }),
          new Skill({ name: '@editerDocEnLigne4' }),
          new Skill({ name: '@partageDroits2' }),
          new Skill({ name: '@partageDroits3' }),
          new Skill({ name: '@netiquette2' }),
          new Skill({ name: '@netiquette3' }),
          new Skill({ name: '@netiquette4' }),
          new Skill({ name: '@sauvegarde2' }),
          new Skill({ name: '@support1' }),
          new Skill({ name: '@support2' }),
          new Skill({ name: '@support4' }),
          new Skill({ name: '@methodo3' }),
          new Skill({ name: '@accesDonnées1' }),
          new Skill({ name: '@accesDonnées2' }),
          new Skill({ name: '@sécuriseraccès2' }),
          new Skill({ name: '@sourcesinfection1' }),
          new Skill({ name: '@sourcesinfection2' }),
          new Skill({ name: '@sourcesinfection3' }),
          new Skill({ name: '@sourcesinfection4' }),
          new Skill({ name: '@logmalveillant2' }),
          new Skill({ name: '@logmalveillant3' }),
          new Skill({ name: '@logmalveillant4' }),
          new Skill({ name: '@phishing1' }),
          new Skill({ name: '@phishing3' }),
          new Skill({ name: '@logprotection2' }),
          new Skill({ name: '@logprotection3' }),
          new Skill({ name: '@outilsprotection2' }),
          new Skill({ name: '@outilsprotection3' }),
          new Skill({ name: '@choixmotdepasse1' }),
          new Skill({ name: '@choixmotdepasse2' }),
          new Skill({ name: '@choixmotdepasse3' }),
          new Skill({ name: '@identitenum3' }),
          new Skill({ name: '@identitenum4' }),
          new Skill({ name: '@e-reputation3' }),
          new Skill({ name: '@charteInfo3' }),
          new Skill({ name: '@charteInfo4' }),
        ],
      });

      // when
      const promise = targetProfileRepository.get('unusedparameter');

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal(expectedProfile);
      });
    });
  });
});

