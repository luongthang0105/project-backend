import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminAuthRegister,
  clear,
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';

beforeEach(() => {
  clear();
});

describe('adminQuizRemove', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore is empty', () => {
    const unavailableToken = {
      token: '0',
    };
    const result = adminQuizRemove(unavailableToken, 1);
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
    const quiz = adminQuizCreate(user, 'Quiz01', 'myQuiz').content as Quiz;
    const result = adminQuizRemove(invalidToken, quiz.quizId);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Quiz ID does not refer to a valid quiz: dataStore has 0 quiz', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const result = adminQuizRemove(user, 1);
    expect(result).toStrictEqual({
      content: { error: 'Quiz ID does not refer to a valid quiz' },
      statusCode: 400,
    });
  });

  test('Quiz ID does not refer to a valid quiz: dataStore has 1 quiz', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz = adminQuizCreate(user, 'Hi', 'This is my quiz').content as Quiz;
    const result = adminQuizRemove(user, quiz.quizId + 1);
    expect(result).toStrictEqual({
      content: { error: 'Quiz ID does not refer to a valid quiz' },
      statusCode: 400,
    });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const user01 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const user02 = adminAuthRegister(
      'hanh@gmai.com',
      '2705uuwuwuwuwuwuw',
      'Hanh',
      'Han'
    ).content as ReturnedToken;
    const quiz01 = adminQuizCreate(
      user01,
      'Hihihihihih',
      'This is my quiz'
    ).content as Quiz;
    const quiz02 = adminQuizCreate(user02, 'Hiiii', 'This is my quiz').content as Quiz;
    expect(adminQuizRemove(user01, quiz02.quizId)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
    expect(adminQuizRemove(user02, quiz01.quizId)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
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

    const quizRemoved = adminQuizRemove(user, quiz02.quizId);
    expect(quizRemoved).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const result = adminQuizInfo(user, quiz02.quizId);
    expect(result).toStrictEqual({
      content: { error: 'Quiz ID does not refer to a valid quiz' },
      statusCode: 400,
    });
  });
});
