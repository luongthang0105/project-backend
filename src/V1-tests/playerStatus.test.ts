import {
  adminQuizCreate,
  adminAuthLogout,
  adminQuizCreateQuestion,
  adminQuizDeleteQuestion
  } from '../testWrappersV2';
  import {
  adminAuthRegister,
  adminQuizGetSessionStatus,
  adminQuizSessionStart,
  clear,
  playerJoinSession
  } from '../testWrappersV1'
import { Question, Quiz, ReturnedToken } from '../types';

import './toHaveValidRandomPlayerName';
import { expect, test } from '@jest/globals';

describe('playerJoinSession', () => {
  let user1: ReturnedToken;
  let quiz1: Quiz
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
      questInfo1.thumbnailUrl,
    ).content.questionId;

    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
  })
  
  test('Error: Player ID does not exist', () => {
    const player1 = playerJoinSession(session1, "Thomas");
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    })

    const status = playerStatus(player1.content.playerId + 1);

    expect(playerStatus).toStrictEqual({
      content: {
        error: 'Player ID does not exist'
      },
      statusCode: 400
    })
  })

  test('Success: Player ID exists', () => {
    const player1 = playerJoinSession(session1, "Thomas");
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    })

    const status = playerStatus(player1.content.playerId);

    expect(playerStatus).toStrictEqual({
      content: {
        state: "LOBBY",
        numQuestions: 1,
        atQuestion: 0
      },
      statusCode: 200
    })
  })

  test('Success: At question 1', () => {
    const player1 = playerJoinSession(session1, "Thomas");
    expect(player1).toStrictEqual({
      content: {
        playerId: expect.any(Number)
      },
      statusCode: 200
    })

    const nextQ = adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, "NEXT_QUESTION");
    expect(nextQ.statusCode).toBe(200);
    
    const status = playerStatus(player1.content.playerId);

    expect(playerStatus).toStrictEqual({
      content: {
        state: "LOBBY",
        numQuestions: 1,
        atQuestion: 1
      },
      statusCode: 200
    })
  })

})