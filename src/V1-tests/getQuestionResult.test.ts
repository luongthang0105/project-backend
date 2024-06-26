import { adminQuizCreate, adminQuizCreateQuestion } from '../testWrappersV2';

import {
  adminAuthRegister,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  clear,
  playerJoinSession,
  getQuestionResult,
  playerSubmission,
} from '../testWrappersV1';
import { Question, Quiz, ReturnedToken } from '../types';

import { expect, test } from '@jest/globals';
import { sleepSync } from './sleepSync';

describe('getQuestionResult', () => {
  let duration: number;
  let user1: ReturnedToken;
  let quiz1: Quiz;
  let questInfo1: Question;
  let session1: number;
  let player1: number;
  beforeEach(() => {
    clear();
    duration = 2;
    user1 = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
      .content as ReturnedToken;
    quiz1 = adminQuizCreate(user1, 'Quiz 1', 'Description').content as Quiz;
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
          answer: 'Doraemon',
          correct: false,
        },
        {
          answer: 'Sakura',
          correct: true,
        },
        {
          answer: 'Sasuke',
          correct: false,
        },
      ],
      thumbnailUrl:
        'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png',
    };
    adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo1.question,
      questInfo1.duration,
      questInfo1.points,
      questInfo1.answers,
      questInfo1.thumbnailUrl
    ).content as Question;

    const questInfo2 = {
      question: 'What is that football player',
      duration: duration,
      points: 10,
      answers: [
        {
          answer: 'Eden Hazard',
          correct: true,
        },
        {
          answer: 'Cole Palmer',
          correct: false,
        },
      ],
      thumbnailUrl:
        'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png',
    };
    adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers,
      questInfo2.thumbnailUrl
    );

    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
    player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    expect(player1).toStrictEqual(expect.any(Number));
  });

  test('Player ID does not exist', () => {
    const result = getQuestionResult(player1 + 1, 1);
    expect(result).toStrictEqual({
      content: {
        error: 'Player ID does not exist',
      },
      statusCode: 400,
    });
  });

  test('Question position is not valid for the session this player is in', () => {
    const result = getQuestionResult(player1, 0);
    expect(result).toStrictEqual({
      content: {
        error:
          'Question position is not valid for the session this player is in',
      },
      statusCode: 400,
    });
  });

  test('Question position is not valid for the session this player is in', () => {
    const result = getQuestionResult(player1, 3);
    expect(result).toStrictEqual({
      content: {
        error:
          'Question position is not valid for the session this player is in',
      },
      statusCode: 400,
    });
  });

  test('Session is not in ANSWER_SHOW state', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    playerSubmission([0, 1], player1, 0);
    const result = getQuestionResult(player1, 1);
    expect(result).toStrictEqual({
      content: {
        error: 'Session is not in ANSWER_SHOW state',
      },
      statusCode: 400,
    });
  });

  test('Session is not yet up to this question', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );

    sleepSync(duration - 1);
    playerSubmission([0], player1, 1);
    sleepSync(1);

    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'GO_TO_ANSWER');
    const result = getQuestionResult(player1, 2);
    expect(result).toStrictEqual({
      content: {
        error: 'Session is not yet up to this question',
      },
      statusCode: 400,
    });
  });

  test('Successful case: get question 1 result', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );

    sleepSync(duration - 1);
    playerSubmission([0, 2], player1, 1);
    sleepSync(1);

    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'GO_TO_ANSWER');

    const result = getQuestionResult(player1, 1);
    expect(result).toStrictEqual({
      content: {
        questionId: 0,
        playersCorrectList: ['Thomas'],
        averageAnswerTime: duration - 1,
        percentCorrect: 100,
      },
      statusCode: 200,
    });
  });

  test('Successful case: get question 2 result', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );

    sleepSync(duration - 1);
    playerSubmission([0], player1, 1);
    sleepSync(1);

    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );

    sleepSync(duration - 1);
    playerSubmission([1], player1, 2);
    sleepSync(1);

    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'GO_TO_ANSWER');
    const result = getQuestionResult(player1, 2);
    expect(result).toStrictEqual({
      content: {
        questionId: 1,
        playersCorrectList: [],
        averageAnswerTime: duration - 1,
        percentCorrect: 0,
      },
      statusCode: 200,
    });
  });

  test('Successful case: No answer submission', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    sleepSync(duration);
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'GO_TO_ANSWER');
    const result = getQuestionResult(player1, 1);
    expect(result).toStrictEqual({
      content: {
        questionId: 0,
        playersCorrectList: [],
        averageAnswerTime: 0,
        percentCorrect: 0,
      },
      statusCode: 200,
    });
    clear();
  });
});

describe('Longer test', () => {
  test('Successful case: different percentCorrect ', () => {
    const duration = 3;
    const user1 = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
      .content as ReturnedToken;
    const quiz1 = adminQuizCreate(user1, 'Quiz 1', 'Description').content as Quiz;
    const questInfo1 = {
      question: 'What is that pokemon',
      duration: duration,
      points: 5,
      answers: [
        {
          answer: 'Pikachu',
          correct: true,
        },
        {
          answer: 'Doraemon',
          correct: false,
        },
        {
          answer: 'Sakura',
          correct: true,
        },
        {
          answer: 'Sasuke',
          correct: false,
        },
      ],
      thumbnailUrl:
      'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png',
    };
  adminQuizCreateQuestion(
    user1,
    quiz1.quizId,
    questInfo1.question,
    questInfo1.duration,
    questInfo1.points,
    questInfo1.answers,
    questInfo1.thumbnailUrl
  ).content as Question;

  const session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;

  const player1 = playerJoinSession(session1, 'Thomas').content.playerId;

  expect(player1).toStrictEqual(expect.any(Number));

  const player2 = playerJoinSession(session1, 'Reece James').content.playerId;
  const player3 = playerJoinSession(session1, 'Thiago Silva').content
    .playerId;
  adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
  adminQuizSessionStateUpdate(
    user1,
    quiz1.quizId,
    session1,
    'SKIP_COUNTDOWN'
  );
  sleepSync(1);

  playerSubmission([1], player2, 1); // false
  sleepSync(1);

  playerSubmission([0, 2], player3, 1); // true

  sleepSync(1);

  adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'GO_TO_ANSWER');

  const result = getQuestionResult(player3, 1);
  expect(result).toStrictEqual({
    content: {
      questionId: 0,
      playersCorrectList: ['Thiago Silva'],
      averageAnswerTime: 2,
      percentCorrect: 33,
    },
    statusCode: 200,
  });
  });
});
