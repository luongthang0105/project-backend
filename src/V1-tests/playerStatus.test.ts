import {
  adminQuizCreate,
  adminQuizCreateQuestion,
} from '../testWrappersV2';
import {
  adminAuthRegister,
  adminQuizGetSessionStatus,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  clear,
  playerJoinSession,
  playerStatus
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';

import './toHaveValidRandomPlayerName';
import { expect, test } from '@jest/globals';
import { sleepSync } from './sleepSync';

describe('playerJoinSession', () => {
  let user1: ReturnedToken;
  let quiz1: Quiz;
  let questInfo1;
  let question1;
  let session1: number;
  const duration = 0.25;

  beforeEach(() => {
    clear();
    user1 = adminAuthRegister(
      'sasaki@gmai.com',
      '2705uwuwuwuwuwuw',
      'Mutsuki',
      'Sasaki'
    ).content as ReturnedToken;
    quiz1 = adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz').content as Quiz;
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
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
      questInfo1.answers,
      questInfo1.thumbnailUrl
    ).content.questionId;
    expect(question1).toStrictEqual(expect.any(Number));
    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
  });

  test('Error: Player ID does not exist', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const status = playerStatus(player1.content.playerId + 1);

    expect(status).toStrictEqual({
      content: {
        error: 'Player ID does not exist'
      },
      statusCode: 400
    });
  });

  test('Success: Player ID exists', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const status = playerStatus(player1.content.playerId);

    expect(status).toStrictEqual({
      content: {
        state: 'LOBBY',
        numQuestions: 2,
        atQuestion: 0
      },
      statusCode: 200
    });
  });

  test('Success: At question 1', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    expect(nextQ.statusCode).toBe(200);

    const status = playerStatus(player1.content.playerId);

    expect(status).toStrictEqual({
      content: {
        state: 'QUESTION_COUNTDOWN',
        numQuestions: 2,
        atQuestion: 1
      },
      statusCode: 200
    });
  });

  test('Success: At END state', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'END');
    expect(nextQ.statusCode).toBe(200);

    const status = playerStatus(player1.content.playerId);

    expect(status).toStrictEqual({
      content: {
        state: 'END',
        numQuestions: 2,
        atQuestion: 0
      },
      statusCode: 200
    });
  });

  test('Success: At FINAL_RESULTS state', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    // jest.useFakeTimers();

    let nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    const skip = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'SKIP_COUNTDOWN');

    expect(nextQ.statusCode).toBe(200);
    expect(skip.statusCode).toBe(200);

    // jest.advanceTimersByTime(duration * 1000);
    // jest.runOnlyPendingTimers()
    // jest.runAllTimers();
    sleepSync(duration);

    const state = adminQuizGetSessionStatus(user1, quiz1.quizId, session1).content.state;
    expect(state).toStrictEqual('QUESTION_CLOSE');

    nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'GO_TO_FINAL_RESULTS');
    expect(nextQ.statusCode).toBe(200);

    const status = playerStatus(player1.content.playerId);

    expect(status).toStrictEqual({
      content: {
        state: 'FINAL_RESULTS',
        numQuestions: 2,
        atQuestion: 0
      },
      statusCode: 200
    });
    // jest.useRealTimers()
  });

  test('Success: At question 2', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    let nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    const skip = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'SKIP_COUNTDOWN');

    expect(nextQ.statusCode).toBe(200);
    expect(skip.statusCode).toBe(200);

    // jest.advanceTimersByTime(duration * 1000);
    sleepSync(duration);

    const state = adminQuizGetSessionStatus(user1, quiz1.quizId, session1).content.state;
    expect(state).toStrictEqual('QUESTION_CLOSE');

    nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');

    expect(nextQ.statusCode).toBe(200);

    const status = playerStatus(player1.content.playerId);
    expect(status).toStrictEqual({
      content: {
        state: 'QUESTION_COUNTDOWN',
        numQuestions: 2,
        atQuestion: 2
      },
      statusCode: 200
    });
    // jest.useRealTimers();
  });
});
