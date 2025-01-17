const { knex } = require('../db/knex-database-connection');
const bluebird = require('bluebird');
const handleAutoJury = require('../lib/domain/events/handle-auto-jury');
const certificationIssueReportRepository = require('../lib/infrastructure/repositories/certification-issue-report-repository');
const certificationAssessmentRepository = require('../lib/infrastructure/repositories/certification-assessment-repository');
const certificationCourseRepository = require('../lib/infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../lib/infrastructure/repositories/challenge-repository');
const logger = require('../lib/infrastructure/logger');
const SessionFinalized = require('../lib/domain/events/SessionFinalized');
const { eventDispatcher } = require('../lib/domain/events');
const IS_FROM_SCRATCH = process.env.IS_FROM_SCRATCH === 'true';
const AUDIT_TABLE = 'autojury-script-audit';

const _triggerAutoJury = async (event) => {
  return await handleAutoJury({
    event,
    certificationIssueReportRepository,
    certificationAssessmentRepository,
    certificationCourseRepository,
    challengeRepository,
    logger,
  });
};

async function _retrieveFinalizedUnpublishedUnassignedSessionsData() {
  return await knex('sessions')
    .select(
      'sessions.id',
      'sessions.certificationCenter',
      'sessions.finalizedAt',
      'sessions.date',
      'sessions.time',
      'sessions.examinerGlobalComment'
    )
    .join('finalized-sessions', 'finalized-sessions.sessionId', 'sessions.id')
    .where('isPublishable', '=', 'false')
    .whereNotNull('sessions.finalizedAt')
    .whereNull('sessions.publishedAt')
    .whereNull('sessions.assignedCertificationOfficerId');
}

async function _triggerAutoJuryFromEvents(events) {
  console.error(`\nWork in progress (${events.length})...`);
  return await bluebird.map(
    events,
    async (event) => {
      try {
        await _doing(event.sessionId);
        const resultingEvents = await _triggerAutoJury(event);
        for (const resultingEvent of resultingEvents) {
          await eventDispatcher.dispatch(resultingEvent);
        }
        await _done(event.sessionId);
        process.stderr.write('😻');
      } catch (err) {
        await _toRetry(event.sessionId, err);
        process.stderr.write('👹');
      }
    },
    { concurrency: ~~process.env.CONCURRENCY || 10 }
  );
}

function _sessionDataToEvent(sessionData) {
  return new SessionFinalized({
    sessionId: sessionData.id,
    finalizedAt: sessionData.finalizedAt,
    hasExaminerGlobalComment: Boolean(sessionData.examinerGlobalComment),
    sessionDate: sessionData.date,
    sessionTime: sessionData.time,
    certificationCenterName: sessionData.certificationCenter,
  });
}

async function _writeEventsToAuditTable(events) {
  const dtos = events.map((event) => {
    return {
      ...event,
      status: 'TO DO',
    };
  });
  return await knex.batchInsert(AUDIT_TABLE, dtos);
}

async function _retrieveEventsFromAuditTable() {
  const dtos = await knex(AUDIT_TABLE)
    .select(
      'sessionId',
      'certificationCenterName',
      'finalizedAt',
      'sessionDate',
      'sessionTime',
      'hasExaminerGlobalComment'
    )
    .where('status', '!=', 'DONE');
  return dtos.map((dto) => new SessionFinalized(dto));
}

async function _printAudit() {
  const dtos = await knex(AUDIT_TABLE).select('sessionId', 'status', 'error');

  const todos = dtos.filter((dto) => dto.status === 'TO DO');
  const doings = dtos.filter((dto) => dto.status === 'DOING');
  const dones = dtos.filter((dto) => dto.status === 'DONE');
  const toRetrys = dtos.filter((dto) => dto.status === 'TO RETRY');

  console.error(`😴 TO DO (${todos.length})`);
  todos.forEach((todo) => console.error(' ' + todo.sessionId));
  console.error('\n\n');
  console.error(`🤪 DOING (${doings.length})`);
  doings.forEach((doing) => console.error(' ' + doing.sessionId));
  console.error('\n\n');
  console.error(`😻 DONE (${dones.length})`);
  dones.forEach((done) => console.error(' ' + done.sessionId));
  console.error('\n\n');
  console.error(`👹 TO RETRY (${toRetrys.length})`);
  toRetrys.forEach((toRetry) => {
    console.error(' ' + toRetry.sessionId);
    console.error(' ' + toRetry.error);
  });
}

async function main() {
  try {
    let finalizedSessionEvents;

    if (IS_FROM_SCRATCH) {
      await _emptyAuditTable();
      const sessionsData = await _retrieveFinalizedUnpublishedUnassignedSessionsData();
      finalizedSessionEvents = sessionsData.map(_sessionDataToEvent);
      await _writeEventsToAuditTable(finalizedSessionEvents);
    } else {
      finalizedSessionEvents = await _retrieveEventsFromAuditTable();
    }

    await _triggerAutoJuryFromEvents(finalizedSessionEvents);

    console.log('\n\nDone.');
    console.log('\n***** Results *****');
    await _printAudit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function _emptyAuditTable() {
  await knex(AUDIT_TABLE).delete();
}

async function _doing(sessionId) {
  await knex(AUDIT_TABLE).update({ error: '', status: 'DOING' }).where({ sessionId });
}

async function _done(sessionId) {
  await knex(AUDIT_TABLE).update({ status: 'DONE' }).where({ sessionId });
}

async function _toRetry(sessionId, error) {
  await knex(AUDIT_TABLE)
    .update({ status: 'TO RETRY', error: error.stack.toString().substring(0, 700) })
    .where({ sessionId });
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}
