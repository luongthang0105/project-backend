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
  getQuestionResult
} from '../testWrappersV1';
import { Question, Quiz, ReturnedToken } from '../types';

import { expect, test } from '@jest/globals';

describe('getQuestionResult', () => {
  let user1: ReturnedToken;
  let quiz1: Quiz;
  let questInfo1: Question;
  let question1: Question;
  let submission;
  let session1:number;
  beforeEach(() => {
    clear();
    user1 = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
      .content as ReturnedToken;
    quiz1 = adminQuizCreate(user1, 'Quiz 1', 'Description').content as Quiz;
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
      thumbnailUrl: 'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png'

    };
    question1 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo1.question,
      questInfo1.duration,
      questInfo1.points,
      questInfo1.answers,
      questInfo1.thumbnailUrl
    ).content as Question;
    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
  });

  test('Player ID does not exist', () => {
    /// /////////////// what are answerIds
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    const result = getQuestionResult(player1 + 1, 1, [1, 2, 3]);
    expect(result).toStrictEqual({
      content: {
        error: 'Player ID does not exist',
      },
      statusCode: 400,
    });
  });

  test('Question position is not valid for the session this player is in', () => {
    /// /////////////// what are answerIds
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    const result = getQuestionResult(player1, 0, [1, 2, 3]);
    expect(result).toStrictEqual({
      content: {
        error:
          'question position is not valid for the session this player is in',
      },
      statusCode: 400,
    });
  });

  test('Question position is not valid for the session this player is in', () => {
    /// /////////////// what are answerIds
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    const questInfo2 = {
      question: 'What is that football player',
      duration: 8,
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
      thumbnailUrl: 'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-cat-on-white-background-png-image_7094927.png'
    };
    const question2 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers,
      questInfo2.thumbnailUrl
    ).content as Question;

    const result = getQuestionResult(player1, 3, [1, 2, 3]);
    expect(result).toStrictEqual({
      content: {
        error:
          'Question position is not valid for the session this player is in',
      },
      statusCode: 400,
    });
  });

  test('Session is not in ANSWER_SHOW state', () => {
    /// /////////////// what are answerIds
    const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    const result = getQuestionResult(player1, 1, [1, 2, 3]);
    expect(result).toStrictEqual({
      content: {
        error:
          'Session is not in ANSWER_SHOW state',
      },
      statusCode: 400,
    });
  });

  test('Session is not yet up to this question', () => {
    /// /////////////// what are answerIds
    const questInfo2 = {
      question: 'What is that football player',
      duration: 8,
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
    };
      adminQuizCreateQuestion(
        user1,
        quiz1.quizId,
        questInfo2.question,
        questInfo2.duration,
        questInfo2.points,
        questInfo2.answers
      ).content as Question;
      const player1 = playerJoinSession(session1, 'Thomas').content.playerId;
      playerSubmitAnswer(player1, 1, [1, 2, 3]);
      adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'ANSWER_SHOW');
      const result = getQuestionResult(player1, 2, [1, 2, 3]);
      expect(result).toStrictEqual({
        content: {
          error:
          'Session is not yet up to this question',
        },
        statusCode: 400,
      });
  });

  // add more test cases for successful
});
