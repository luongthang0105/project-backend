import {
  adminAuthRegister,
  clear,
  adminQuizViewSessions,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
} from '../testWrappersV1';
import { adminQuizCreate, adminQuizCreateQuestion } from '../testWrappersV2';

import { Question, Quiz, ReturnedToken } from '../types';

let user1: ReturnedToken;
let quiz1: Quiz;
let questInfo1: Question;
let question1: number;
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
    duration: 2,
    thumbnailUrl: 'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
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
});

describe('adminQuizViewSessions', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const invalidToken = {
      token: '-1',
    };
    const result = adminQuizViewSessions(invalidToken, quiz1.quizId);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },

      statusCode: 401,
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz: quizId does not exist', () => {
    const result = adminQuizViewSessions(user1, quiz1.quizId + 1);
    expect(result).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz: quizId does not owned by this user', () => {
    const user2 = adminAuthRegister(
      'sasaki@gmai.com',
      '2705uwuwuwuwuwuw',
      'Mutsuki',
      'Sasaki'
    ).content as ReturnedToken;
    const quiz2 = adminQuizCreate(user2, 'Hihihihihih', 'This is my quiz')
      .content as Quiz;
    const result = adminQuizViewSessions(user1, quiz2.quizId);
    expect(result).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Successful case: view active and inactive sessions', () => {
    const session1 = adminQuizSessionStart(user1, quiz1.quizId, 2).content
      .sessionId;
    const session2 = adminQuizSessionStart(user1, quiz1.quizId, 3).content
      .sessionId;
    const session3 = adminQuizSessionStart(user1, quiz1.quizId, 4).content
      .sessionId;
    const session4 = adminQuizSessionStart(user1, quiz1.quizId, 7).content
      .sessionId;

    adminQuizSessionStateUpdate(user1, quiz1.quizId, session1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session2,
      'SKIP_COUNTDOWN'
    );

    adminQuizSessionStateUpdate(user1, quiz1.quizId, session3, 'END');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, session4, 'END');

    const result = adminQuizViewSessions(user1, quiz1.quizId).content;

    expect(result.inactiveSessions).toContain(session3);
    expect(result.inactiveSessions).toContain(session4);
    expect(result.inactiveSessions[0]).toBeLessThan(result.inactiveSessions[1]);

    expect(result.activeSessions).toContain(session1);
    expect(result.activeSessions).toContain(session2);
    expect(result.activeSessions[0]).toBeLessThan(result.activeSessions[1]);
  });
});
