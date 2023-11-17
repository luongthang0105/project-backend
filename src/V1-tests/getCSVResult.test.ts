import { adminQuizCreate, adminQuizCreateQuestion } from '../testWrappersV2';

import {
  adminAuthRegister,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  clear,
  playerJoinSession,
  playerSubmission,
  getCSVResult,
  adminQuizInfo,
} from '../testWrappersV1';
import { Question, Quiz, ReturnedToken } from '../types';

import { expect, test } from '@jest/globals';
import { sleepSync } from './sleepSync';
let user1: ReturnedToken;
let quiz1: Quiz;
let questInfo1: Question;
let questInfo2: Question;
let question1: number;
let question2: number;
let session1: number;
const duration = 4;
describe('getQuestionResult', () => {
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
      thumbnailUrl:
        'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
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
    };
    questInfo2 = {
      question: 'Are penguins birds?',
      duration: duration,
      thumbnailUrl: 'https://as2./97/penguinQ.jpg',
      points: 4,
      answers: [
        {
          answer: 'Yes',
          correct: true,
        },
        {
          answer: 'No',
          correct: false,
        },
      ],
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
    question2 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers,
      questInfo2.thumbnailUrl
    ).content.questionId;
    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
    expect(question1).toStrictEqual(expect.any(Number));
    expect(question2).toStrictEqual(expect.any(Number));
  });

  test('QuizId is invalid', () => {
    const result = getCSVResult(user1, quiz1.quizId + 1, session1);
    expect(result).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const invalidToken = {
      token: '-1',
    };
    const result = getCSVResult(invalidToken, quiz1.quizId, session1);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Session Id does not refer to a valid session within this quiz', () => {
    const result = getCSVResult(user1, quiz1.quizId, session1 + 1);
    expect(result).toStrictEqual({
      content: {
        error: 'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 403,
    });
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const result = getCSVResult(user1, quiz1.quizId, session1);
    expect(result).toStrictEqual({
      content: {
        error: 'Session is not in FINAL_RESULTS state',
      },
      statusCode: 403,
    });
  });

  test.only('Successful case', () => {
    const player1 = playerJoinSession(session1, 'Mutsuki').content.playerId;
    const player2 = playerJoinSession(session1, 'Thomas').content.playerId;
    const player3 = playerJoinSession(session1, 'Han').content.playerId;
    const answerId1 = adminQuizInfo(user1, quiz1.quizId).content.questions[0]
      .answers[0].answerId as number;
    const answerId2 = adminQuizInfo(user1, quiz1.quizId).content.questions[1]
      .answers[0].answerId as number;
    const answerId3 = adminQuizInfo(user1, quiz1.quizId).content.questions[1]
      .answers[1].answerId as number;
    const answer1 = [answerId1];
    const answer2 = [answerId2];
    const answer3 = [answerId3];

    let status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(status.statusCode).toBe(200);

    sleepSync(1);
    playerSubmission(answer1, player1, 1);
    sleepSync(1);
    playerSubmission(answer1, player2, 1);
    sleepSync(1);
    playerSubmission(answer1, player3, 1);
    sleepSync(1);

    status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'NEXT_QUESTION'
    );
    expect(status.statusCode).toBe(200);
    status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'SKIP_COUNTDOWN'
    );
    expect(status.statusCode).toBe(200);

    sleepSync(1);
    playerSubmission(answer2, player1, 2);
    sleepSync(1);
    playerSubmission(answer3, player2, 2);
    sleepSync(1);
    playerSubmission(answer3, player3, 2);
    sleepSync(1);

    status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      'GO_TO_FINAL_RESULTS'
    );
    expect(status.statusCode).toBe(200);

    const result = getCSVResult(user1, quiz1.quizId, session1);
    expect(result).toStrictEqual({
      content: {
        url: expect.any(String)
      }
    });
  });
});
