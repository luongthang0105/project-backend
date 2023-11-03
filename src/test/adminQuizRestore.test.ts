import {
  adminQuizCreate,
  adminQuizRemove,
  adminAuthRegister,
  adminQuizRestore,
  clear,
  adminQuizViewTrash,
  adminQuizList,
} from '../testWrappers';
import { Quiz, QuizList, ReturnedToken } from '../types';

beforeEach(() => {
  clear();
});

describe('adminQuizRestore', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore is empty', () => {
    const unavailableToken = {
      token: '0',
    };
    const result = adminQuizRestore(unavailableToken, 1);
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
    const result = adminQuizRestore(invalidToken, quiz.quizId);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Quiz name of the restored quiz is already used by another active quiz', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz1 = adminQuizCreate(user, 'Quiz01', 'myQuiz').content as Quiz;
    adminQuizRemove(user, quiz1.quizId);
    adminQuizCreate(user, 'Quiz01', 'myQuiz');
    const result = adminQuizRestore(user, quiz1.quizId);
    expect(result).toStrictEqual({
      content: { error: 'Quiz name of the restored quiz is already used by another active quiz' },
      statusCode: 400,
    });
  });

  test('Quiz name of the restored quiz is already used by another active quiz (Owned by another user)', () => {
    const user1 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const user2 = adminAuthRegister(
      'mutsuki@gmai.com',
      '2705uuwuwuwuw',
      'Mutsuki',
      'Sasaki'
    ).content as ReturnedToken;
    const quiz1 = adminQuizCreate(user1, 'Quiz01', 'myQuiz').content as Quiz;
    adminQuizRemove(user1, quiz1.quizId);
    adminQuizCreate(user2, 'Quiz01', 'myQuiz');
    const result = adminQuizRestore(user1, quiz1.quizId);
    expect(result).toStrictEqual({
      content: { error: 'Quiz name of the restored quiz is already used by another active quiz' },
      statusCode: 400,
    });
  });

  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz = adminQuizCreate(user, 'Hi', 'This is my quiz').content as Quiz;
    const result = adminQuizRestore(user, quiz.quizId);
    expect(result).toStrictEqual({
      content: { error: 'Quiz ID refers to a quiz that is not currently in the trash' },
      statusCode: 400,
    });
  });

  test('Quiz ID refers to a quiz that is not currently in the trash (trash -> restore)', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz = adminQuizCreate(user, 'Hi', 'This is my quiz').content as Quiz;
    adminQuizRemove(user, quiz.quizId);
    adminQuizRestore(user, quiz.quizId);
    const result = adminQuizRestore(user, quiz.quizId);
    expect(result).toStrictEqual({
      content: { error: 'Quiz ID refers to a quiz that is not currently in the trash' },
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
    adminQuizRemove(user01, quiz01.quizId);
    adminQuizRemove(user02, quiz02.quizId);
    expect(adminQuizRestore(user01, quiz02.quizId)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
    expect(adminQuizRestore(user02, quiz01.quizId)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Successful case: create => remove => restore', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    const quiz01 = adminQuizCreate(user, 'Hiiii', 'This is my quiz').content as Quiz;

    adminQuizRemove(user, quiz01.quizId);
    const result = adminQuizRestore(user, quiz01.quizId);
    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const trash = adminQuizViewTrash(user).content;
    expect(trash).toStrictEqual({
      quizzes: []
    });

    const quizzes = (adminQuizList(user).content as QuizList);
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
          quizId: quiz01.quizId,
          name: 'Hiiii',
        }
      ]
    });
  });

  test('Successful case: create1 => create2 => remove1 => remove2 => restore1', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    const quiz01 = adminQuizCreate(user, 'Hiiii', 'This is my quiz').content as Quiz;
    const quiz02 = adminQuizCreate(user, 'loooo', 'This is my quiz').content as Quiz;

    adminQuizRemove(user, quiz01.quizId);
    adminQuizRemove(user, quiz02.quizId);
    const result = adminQuizRestore(user, quiz01.quizId);
    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const trash = adminQuizViewTrash(user).content;
    expect(trash).toStrictEqual({
      quizzes: [
        {
          quizId: quiz02.quizId,
          name: 'loooo',
        }
      ]
    });

    const quizzes = adminQuizList(user).content;
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
          quizId: quiz01.quizId,
          name: 'Hiiii',
        }
      ]
    });
  });

  test('Successful case: create1 => create2 => remove2 => remove1 => restore2', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    const quiz01 = adminQuizCreate(user, 'Hiiii', 'This is my quiz').content as Quiz;
    const quiz02 = adminQuizCreate(user, 'loooo', 'This is my quiz').content as Quiz;

    adminQuizRemove(user, quiz02.quizId);
    adminQuizRemove(user, quiz01.quizId);
    const result = adminQuizRestore(user, quiz02.quizId);
    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const trash = adminQuizViewTrash(user).content;
    expect(trash).toStrictEqual({
      quizzes: [
        {
          quizId: quiz01.quizId,
          name: 'Hiiii',
        }
      ]
    });

    const quizzes = adminQuizList(user).content;
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
          quizId: quiz02.quizId,
          name: 'loooo',
        }
      ]
    });
  });

  test('Successful case: create1 => create2 => remove2 => remove1 => restore1', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    const quiz01 = adminQuizCreate(user, 'Hiiii', 'This is my quiz').content as Quiz;
    const quiz02 = adminQuizCreate(user, 'loooo', 'This is my quiz').content as Quiz;

    adminQuizRemove(user, quiz02.quizId);
    adminQuizRemove(user, quiz01.quizId);
    const result = adminQuizRestore(user, quiz01.quizId);
    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const trash = adminQuizViewTrash(user).content;
    expect(trash).toStrictEqual({
      quizzes: [
        {
          quizId: quiz02.quizId,
          name: 'loooo',
        }
      ]
    });

    const quizzes = adminQuizList(user).content;
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
          quizId: quiz01.quizId,
          name: 'Hiiii',
        }
      ]
    });
  });
});
