import { adminQuizCreate, adminQuizCreateQuestion } from '../testWrappersV2';
import {
  adminAuthRegister,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  clear,
  playerJoinSession,
  playerStatus,
  playerSubmission,
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';

import './toHaveValidRandomPlayerName';
import { expect, test } from '@jest/globals';
import { sleepSync } from './sleepSync';

describe('playerSubmission', () => {
  let user1: ReturnedToken;
  let quiz1: Quiz;
  let questInfo1;
  let question1;
  let session1: number;
  const duration = 0.2;

  beforeEach(() => {
    clear();
    user1 = adminAuthRegister(
      'sasaki@gmai.com',
      '2705uwuwuwuwuwuw',
      'Mutsuki',
      'Sasaki'
    ).content as ReturnedToken;
    quiz1 = adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz')
      .content as Quiz;
    questInfo1 = {
      question: 'What is that pokemon',
      duration: duration,
      points: 5,
      answers: [
        {
          answer: 'Pikachu',
          correct: true,
        },
        {
          answer: 'Thomas',
          correct: false,
        },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    question1 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo1.question,
      questInfo1.duration,
      questInfo1.points,
      questInfo1.answers,
      questInfo1.thumbnailUrl
    ).content.questionId;

    question1 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo1.question,
      questInfo1.duration,
      questInfo1.points,
      [
        {
          answer: 'Pikachu',
          correct: true,
        },
        {
          answer: 'Thomas',
          correct: true,
        },
      ],
      questInfo1.thumbnailUrl
    ).content.questionId;
    expect(question1).toStrictEqual(expect.any(Number));
    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
  });

  test('Error: Player ID does not exist', () => {
    const status = playerSubmission([0], -1, 1);

    expect(status).toStrictEqual({
      content: {
        error: 'Player ID does not exist',
      },
      statusCode: 400,
    });
  });

  test.each([
    // For LOBBY state only (and END and FINAL_RES)
    { questionPos: 0 },
    // Out of bounds
    { questionPos: 3 },
    // Out of bounds
    { questionPos: -1 },
  ])(
    'Error: Question position is not valid for the session this player is in',
    ({ questionPos }) => {
      const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
      expect(player1).toStrictEqual(expect.any(Number));

      const status = playerSubmission([0], player1, questionPos);
      expect(status).toStrictEqual({
        content: {
          error:
            'Question position is not valid for the session this player is in',
        },
        statusCode: 400,
      });
    }
  );

  test('Error: Session is not in QUESTION_OPEN state, At LOBBY', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const status = playerSubmission([0], player1, 1);

    expect(status).toStrictEqual({
      content: {
        error: 'Session is not in QUESTION_OPEN state',
      },
      statusCode: 400,
    });
  });

  test('Error: Session is not in QUESTION_OPEN state, At QUESTION_COUNTDOWN', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_COUNTDOWN');

    const res = playerSubmission([0], player1, 1);
    expect(res).toStrictEqual({
      content: {
        error: 'Session is not in QUESTION_OPEN state',
      },
      statusCode: 400,
    });
  });

  test('Error: If session is not yet up to this question', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    // Currently at question 1, now submit to question 2
    const res = playerSubmission([0], player1, 2);
    expect(res).toStrictEqual({
      content: {
        error: 'If session is not yet up to this question',
      },
      statusCode: 400,
    });
  });

  test.each([
    // Neg id mix with valid ids
    { answerIds: [-1, 0, 1] },
    // Neg id only
    { answerIds: [-1] },
    // Out of bound id mix with valid id
    { answerIds: [2, 0] },
    // Out of bound id only
    { answerIds: [2] },
    // Out of bound id and neg id
    { answerIds: [2, -1] },
    // Out of bound id and neg id mix with valid id
    { answerIds: [2, -1, 3, 0] },
  ])('Error: Answer IDs are not valid for this particular question', ({ answerIds }) => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    // Valid answer ids are 0 or 1
    const res = playerSubmission(answerIds, player1, 1);
    expect(res).toStrictEqual({
      content: {
        error: 'Answer IDs are not valid for this particular question',
      },
      statusCode: 400,
    });
  });

  test.each([
    { answerIds: [0, 1, 1, 0] },
    { answerIds: [0, 1, 1] },
    { answerIds: [0, 1, 0] },
  ])('Error: There are duplicate answer IDs provided', ({ answerIds }) => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    // Valid answer ids are 0 or 1
    const res = playerSubmission(answerIds, player1, 1);
    expect(res).toStrictEqual({
      content: {
        error: 'There are duplicate answer IDs provided',
      },
      statusCode: 400,
    });
  });

  test('Error: Less than 1 answer ID was submitted', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    // Empty answer ids
    const res = playerSubmission([], player1, 1);
    expect(res).toStrictEqual({
      content: {
        error: 'Less than 1 answer ID was submitted',
      },
      statusCode: 400,
    });
  });

  test('Success: Player successfully submit answer', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    const res = playerSubmission([0], player1, 1);
    expect(res).toStrictEqual({
      content: {},
      statusCode: 200,
    });
  });

  test('Success: 2 players successfully submit answer', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const player2 = playerJoinSession(session1, 'Han').content.playerId;
    expect(player2).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    let status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    const res = playerSubmission([0], player1, 1);
    const res2 = playerSubmission([1], player2, 1);

    expect(res).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    expect(res2).toStrictEqual({
      content: {},
      statusCode: 200,
    });
  });

  test('Success: 1 player resubmit answer', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const player2 = playerJoinSession(session1, 'Han').content.playerId;
    expect(player2).toStrictEqual(expect.any(Number));

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const status = playerStatus(player1);
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe('QUESTION_OPEN');

    let res = playerSubmission([0], player1, 1);
    res = playerSubmission([1], player1, 1);

    expect(res).toStrictEqual({
      content: {},
      statusCode: 200,
    });
  });

  test('Success: Multiple correct answers on Q2', () => {
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));

    const player2 = playerJoinSession(session1, 'Han').content.playerId;
    expect(player2).toStrictEqual(expect.any(Number));

    let nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    let toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    let status = playerStatus(player1);
    expect(status.content.state).toBe('QUESTION_OPEN');

    // Wait for QUESTION_CLOSE
    sleepSync(duration);

    status = playerStatus(player1);
    expect(status.content.state).toBe('QUESTION_CLOSE');

    nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    toOpenState = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'SKIP_COUNTDOWN');
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    // sleepSync(2);
    const res = playerSubmission([1, 0], player1, 2);

    expect(res).toStrictEqual({
      content: {},
      statusCode: 200,
    });
  });
});
