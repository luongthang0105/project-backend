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
  playerJoinSession
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';

import './toHaveValidRandomPlayerName';
import { expect, test } from '@jest/globals';

describe('adminAllowPlayerJoin', () => {
  let user1: ReturnedToken;
  let quiz1: Quiz;
  let questInfo1;
  let question1;
  let session1: number;

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
      duration: 4,
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
    expect(question1).toStrictEqual(expect.any(Number));
    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
  });

  test('Error: Name of user entered is not unique (compared to other users who have already joined)', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const player2 = playerJoinSession(session1, 'Thomas');
    expect(player2).toStrictEqual({
      content: {
        error: 'Name of user entered is not unique (compared to other users who have already joined)'
      },
      statusCode: 400
    });
  });

  test('Success: Same name but different session', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const session2 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;

    const player2 = playerJoinSession(session2, 'Thomas');
    expect(player2).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
  });

  test('Error: Session is not in LOBBY state', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const sessionUpdate = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    expect(sessionUpdate.statusCode).toBe(200);

    const player2 = playerJoinSession(session1, 'Han');
    expect(player2).toStrictEqual({
      content: {
        error: 'Session is not in LOBBY state'
      },
      statusCode: 400
    });
  });

  test('Success: 1 player joins the game', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
  });

  test('Success: 1 player joins the game, but given name is empty', () => {
    const player1 = playerJoinSession(session1, '');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const sessionStatus = adminQuizGetSessionStatus(user1, quiz1.quizId, session1).content;

    for (const randomPlayerName of sessionStatus.players) { expect(randomPlayerName).toStrictEqual(expect.toHaveValidRandomPlayerName()); }
  });

  test('Success: 2 player joins the game, but their given names are empty', () => {
    const player1 = playerJoinSession(session1, '');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const player2 = playerJoinSession(session1, '');
    expect(player2).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const sessionStatus = adminQuizGetSessionStatus(user1, quiz1.quizId, session1).content;

    for (const randomPlayerName of sessionStatus.players) { expect(randomPlayerName).toStrictEqual(expect.toHaveValidRandomPlayerName()); }
  });

  test('Success: 2 player joins the game, non-empty names', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const player2 = playerJoinSession(session1, 'Han');
    expect(player2).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const sessionStatus = adminQuizGetSessionStatus(user1, quiz1.quizId, session1).content;
    expect(sessionStatus.players).toStrictEqual(['Thomas', 'Han']);
  });

  test('Success: 3 player join the game, which automatically starts the game', () => {
    const player1 = playerJoinSession(session1, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const player2 = playerJoinSession(session1, 'Han');
    expect(player2).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const player3 = playerJoinSession(session1, 'Eden');
    expect(player3).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const sessionStatus = adminQuizGetSessionStatus(user1, quiz1.quizId, session1).content;
    expect(sessionStatus.state).toStrictEqual('QUESTION_COUNTDOWN');
  });

  test('Success: 2 player join the game, autoStartNum is 0', () => {
    const session2 = adminQuizSessionStart(user1, quiz1.quizId, 0).content.sessionId;

    const player1 = playerJoinSession(session2, 'Thomas');
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });
    const player2 = playerJoinSession(session2, 'Han');
    expect(player2).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    });

    const sessionStatus = adminQuizGetSessionStatus(user1, quiz1.quizId, session1).content;
    expect(sessionStatus.state).toStrictEqual('LOBBY');
  });
});
