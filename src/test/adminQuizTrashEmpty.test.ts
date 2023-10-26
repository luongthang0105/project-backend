import {
  adminQuizCreate,
  adminQuizRemove,
  adminAuthRegister,
  clear,
  adminQuizTrashEmpty,
  adminQuizViewTrash,
} from '../testWrappers';
import { Quiz, ReturnedToken } from '../types';

beforeEach(() => {
  clear();
});

describe('adminQuizTrashEmpty', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore is empty', () => {
    const unavailableToken = {
      token: '0',
    };
    const result = adminQuizTrashEmpty(unavailableToken, [1]);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore has 1 user', () => {
    const invalidToken = {
      token: '',
    };
    const result = adminQuizTrashEmpty(invalidToken, [3]);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('One of the Quiz IDs is not in the trash', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz1 = adminQuizCreate(user, 'Quiz01', 'myQuiz').content as Quiz;
    const quiz2 = adminQuizCreate(user, 'Quiz02', 'myQuiz').content as Quiz;
    adminQuizRemove(user, quiz1.quizId);
    const result = adminQuizTrashEmpty(user, [quiz1.quizId, quiz2.quizId]);
    expect(result).toStrictEqual({
      content: { error: 'One or more of the Quiz IDs is not currently in the trash' },
      statusCode: 400,
    });
  });

  test('Both Quiz IDs are not in the trash', () => {
    const user1 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz1 = adminQuizCreate(user1, 'Quiz01', 'myQuiz').content as Quiz;
    const quiz2 = adminQuizCreate(user1, 'Quiz02', 'myQuiz').content as Quiz;
    const result = adminQuizTrashEmpty(user1, [quiz1.quizId, quiz2.quizId]);
    expect(result).toStrictEqual({
      content: { error: 'One or more of the Quiz IDs is not currently in the trash' },
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
    expect(adminQuizTrashEmpty(user01, [quiz02.quizId])).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
    expect(adminQuizTrashEmpty(user02, [quiz01.quizId])).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Successful case: delete 1 quiz', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz01 = adminQuizCreate(user, 'Hiiii', 'This is my quiz').content as Quiz;
    const quiz02 = adminQuizCreate(user, 'koko', 'This is my quiz').content as Quiz;
    adminQuizRemove(user, quiz01.quizId);
    adminQuizRemove(user, quiz02.quizId);
    const result = adminQuizTrashEmpty(user, [quiz01.quizId]);
    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const trash = adminQuizViewTrash(user).content;
    expect(trash).toStrictEqual({
      quizzes: [
        {
          quizId: quiz02.quizId,
          name: 'koko',
        }
      ]
    });
  });

  test('Successful case: delete 2 quizzes', () => {
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
    const result = adminQuizTrashEmpty(user, [quiz01.quizId, quiz02.quizId]);
    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const trash = adminQuizViewTrash(user).content;
    expect(trash).toStrictEqual({
      quizzes: []
    });
  });
});
