import { adminQuizCreate, adminQuizCreateQuestion } from '../testWrappersV2';
import {
  adminAuthRegister,
  adminQuizSessionStart,
  clear,
  playerJoinSession,
  getQuestionInfo,
  adminQuizSessionStateUpdate,
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';
import { expect, test } from '@jest/globals';
import { sleepSync } from './sleepSync';

describe('getQuestionInfo', () => {
  let user1: ReturnedToken;
  let quiz1: Quiz;
  let questInfo1;
  let question1;
  let questInfo2;
  let question2;
  let session1: number;
  let player1: number;
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
      duration: 0.25,
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
      thumbnailUrl:
        'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png',
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
    questInfo2 = {
      question: 'What is that football player',
      duration: 0.25,
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

    question2 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers,
      questInfo2.thumbnailUrl
    ).content.questionId;
    expect(question1).toStrictEqual(expect.any(Number));
    expect(question2).toStrictEqual(expect.any(Number));

    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
    player1 = playerJoinSession(session1, 'Thomas').content.playerId;
  });

  test('Error: PlayerId does not exist', () => {
    const result = getQuestionInfo(player1 + 1, 1);

    expect(result).toStrictEqual({
      content: {
        error: 'Player ID does not exist',
      },
      statusCode: 400,
    });
  });
  test('Question position is not valid for the session this player is in', () => {
    const result = getQuestionInfo(player1, 0);
    expect(result).toStrictEqual({
      content: {
        error:
          'Question position is not valid for the session this player is in',
      },
      statusCode: 400,
    });
  });

  test('Question position is not valid for the session this player is in', () => {
    const result = getQuestionInfo(player1, 3);
    expect(result).toStrictEqual({
      content: {
        error:
          'Question position is not valid for the session this player is in',
      },
      statusCode: 400,
    });
  });

  test('Session is not currently on this question', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    const result = getQuestionInfo(player1, 2);
    expect(result).toStrictEqual({
      content: {
        error: 'Session is not currently on this question',
      },
      statusCode: 400,
    });
  });

  test('Session is in LOBBY or END state', () => {
    const result = getQuestionInfo(player1, 2);
    expect(result).toStrictEqual({
      content: {
        error: 'Session is in LOBBY or END state',
      },
      statusCode: 400,
    });
  });

  test('Success: Return current question in current session: get 1st qs info', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    const result = getQuestionInfo(player1, 1);
    expect(result).toStrictEqual({
      content: {
        questionId: 0,
        question: 'What is that pokemon',
        duration: 0.25,
        thumbnailUrl:
          'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png',
        points: 5,
        answers: [
          {
            answer: 'Pikachu',
            answerId: 0,
            colour: expect.any(String),
            correct: true,
          },
          {
            answer: 'Thomas',
            answerId: 1,
            colour: expect.any(String),
            correct: false,
          },
        ],
      },
      statusCode: 200,
    });
  });

  test('Success: Return current question in current session: get 2nd qs info', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    sleepSync(1);
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    const result = getQuestionInfo(player1, 2);
    expect(result).toStrictEqual({
      content: {
        questionId: 1,
        question: 'What is that football player',
        duration: 0.25,
        thumbnailUrl:
          'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png',
        points: 10,
        answers: [
          {
            answer: 'Eden Hazard',
            answerId: expect.any(Number),
            colour: expect.any(String),
            correct: true,
          },
          {
            answer: 'Cole Palmer',
            answerId: expect.any(Number),
            colour: expect.any(String),
            correct: false,
          },
        ],
      },
      statusCode: 200,
    });
  });
});
