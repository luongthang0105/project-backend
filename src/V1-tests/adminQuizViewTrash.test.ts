import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizViewTrash,
  adminAuthRegister,
  clear,
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';

beforeEach(() => {
  clear();
});

describe('adminQuizViewTrash', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore is empty', () => {
    const unavailableToken = {
      token: '0',
    };
    const result = adminQuizViewTrash(unavailableToken);
    expect(result).toStrictEqual({
      content: {
        error:
            'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore has 1 user', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const invalidToken = {
      token: '-1',
    };
    adminQuizCreate(user, 'Quiz01', 'myQuiz').content as Quiz;
    const result = adminQuizViewTrash(invalidToken);
    expect(result).toStrictEqual({
      content: {
        error:
            'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Successful case: delete 1 quiz from a user who has 2 quizzes', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    adminQuizCreate(user, 'Hihihihihih', 'This is my quiz');

    const quiz02 = adminQuizCreate(user, 'Hiiii', 'This is my quiz').content as Quiz;

    adminQuizRemove(user, quiz02.quizId);
    const result = adminQuizViewTrash(user);
    expect(result).toStrictEqual({
      content: {
        quizzes: [
          {
            quizId: quiz02.quizId,
            name: 'Hiiii'
          }
        ]
      },
      statusCode: 200,
    });
  });
  test('Successful case: delete 2 quiz from 2 users ', () => {
    const user1 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    const user2 = adminAuthRegister(
      'mutsuki@gmai.com',
      '2708uwuwuwuw87uwuw',
      'Mutsuki',
      'Sasaki'
    ).content as ReturnedToken;

    const quiz01 = adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz').content as Quiz;

    const quiz02 = adminQuizCreate(user2, 'Hiiii', 'This is my quiz').content as Quiz;

    adminQuizRemove(user1, quiz01.quizId);
    adminQuizRemove(user2, quiz02.quizId);
    const result1 = adminQuizViewTrash(user1);
    expect(result1).toStrictEqual({
      content: {
        quizzes: [
          {
            quizId: quiz01.quizId,
            name: 'Hihihihihih'
          }
        ]
      },
      statusCode: 200,
    });
    const result2 = adminQuizViewTrash(user2);
    expect(result2).toStrictEqual({
      content: {
        quizzes: [
          {
            quizId: quiz02.quizId,
            name: 'Hiiii'
          }
        ]
      },
      statusCode: 200,
    });
  });
  test('Successful case: delete 2 quizzes from a users ', () => {
    const user1 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    const quiz01 = adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz').content as Quiz;

    const quiz02 = adminQuizCreate(user1, 'Hiiii', 'This is my quiz').content as Quiz;

    adminQuizRemove(user1, quiz01.quizId);
    adminQuizRemove(user1, quiz02.quizId);
    const result = adminQuizViewTrash(user1);
    expect(result).toStrictEqual({
      content: {
        quizzes: [
          {
            quizId: quiz01.quizId,
            name: 'Hihihihihih'
          },
          {
            quizId: quiz02.quizId,
            name: 'Hiiii'
          }
        ]
      },
      statusCode: 200,
    });
  });
  test('Successful case: empty trash ', () => {
    const user1 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

        adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz').content as Quiz;

        const result = adminQuizViewTrash(user1);
        expect(result).toStrictEqual({
          content: {
            quizzes: []
          },
          statusCode: 200,
        });
  });
});
