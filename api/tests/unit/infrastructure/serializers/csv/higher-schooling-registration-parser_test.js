const iconv = require('iconv-lite');
const { expect, catchErr } = require('../../../../test-helper');
const HigherSchoolingRegistrationParser = require('../../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-parser');
const HigherSchoolingRegistrationColumns = require('../../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-columns');
const _ = require('lodash');
const { getI18n } = require('../../../../../tests/tooling/i18n/i18n');
const i18n = getI18n();

const higherSchoolingRegistrationColumns = new HigherSchoolingRegistrationColumns(i18n).columns
  .map((column) => column.label)
  .join(';');

describe('Unit | Infrastructure | HigherSchoolingRegistrationParser', function () {
  context('when the header is correctly formed', function () {
    context('when there is no line', function () {
      it('returns an empty HigherSchoolingRegistrationSet', function () {
        const input = higherSchoolingRegistrationColumns;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new HigherSchoolingRegistrationParser(encodedInput, 123, i18n);

        const higherSchoolingRegistrationSet = parser.parse();

        expect(higherSchoolingRegistrationSet.registrations).to.be.empty;
      });
    });
    context('when there are lines', function () {
      it('returns a HigherSchoolingRegistrationSet with a schooling registration for each line', function () {
        const input = `${higherSchoolingRegistrationColumns}
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new HigherSchoolingRegistrationParser(encodedInput, 456, i18n);

        const higherSchoolingRegistrationSet = parser.parse();
        const registrations = higherSchoolingRegistrationSet.registrations;
        expect(registrations).to.have.lengthOf(2);
      });

      it('returns a HigherSchoolingRegistrationSet with a schooling registration for each line using the CSV column', function () {
        const input = `${higherSchoolingRegistrationColumns}
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Autre;Autre;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT contrôlé par l'Etat;Autre;
        `;
        const organizationId = 789;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId, i18n);

        const higherSchoolingRegistrationSet = parser.parse();
        const registrations = _.sortBy(higherSchoolingRegistrationSet.registrations, 'preferredLastName');
        expect(registrations[0]).to.deep.equal({
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '123456',
          email: 'thebride@example.net',
          birthdate: '1970-01-01',
          diploma: 'Autre',
          department: 'Assassination Squad',
          educationalTeam: 'Hattori Hanzo',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'Autre',
          organizationId,
        });
        expect(registrations[1]).to.deep.equal({
          firstName: 'O-Ren',
          middleName: undefined,
          thirdName: undefined,
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '789',
          email: 'ishii@example.net',
          birthdate: '1980-01-01',
          diploma: "DUT contrôlé par l'Etat",
          department: 'Assassination Squad',
          educationalTeam: 'Bill',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'Autre',
          organizationId,
        });
      });
    });
  });

  context('When a column value does not match requirements', function () {
    const organizationId = 123;

    it('should throw an error if the student number is not unique', async function () {
      const input = `${higherSchoolingRegistrationColumns}
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId, i18n);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('STUDENT_NUMBER_UNIQUE');
      expect(error.meta).to.deep.equal({ line: 3, field: 'Numéro étudiant' });
    });

    it('should throw an error if the student number is has an incorrect  format', async function () {
      const input = `${higherSchoolingRegistrationColumns}
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123@;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1971;thebride@example.net;1234;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId, i18n);

      const error = await catchErr(parser.parse, parser)();

      expect(error.code).to.equal('STUDENT_NUMBER_FORMAT');
      expect(error.meta).to.deep.equal({ line: 2, field: 'Numéro étudiant' });
    });
  });
});
