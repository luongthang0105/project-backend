import {
  adminAuthRegister,
  clear,
} from '../testWrappersV1';

import {
  adminQuizCreate,
  adminQuizInfo
} from '../testWrappersV2';

import { Quiz, ReturnedToken } from '../types';

describe('adminQuizInfo', () => {
  let user: ReturnedToken;
  let quiz: Quiz;
  beforeEach(() => {
    clear();
    user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwu',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    quiz = adminQuizCreate(
      user,
      'New Quiz',
      'description'
    ).content as Quiz;
  });
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const invalidToken = {
      token: '-1',
    };

    const result = adminQuizInfo(invalidToken, quiz.quizId);
    expect(result).toStrictEqual({
      statusCode: 401,
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
    });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const result = adminQuizInfo(user, quiz.quizId + 1);

    expect(result).toStrictEqual({
      statusCode: 403,
      content: { error: 'Valid token is provided, but user is not an owner of this quiz' },
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = adminAuthRegister(
      'thang@gmail.com',
      '0105uwuwuw',
      'Thomas',
      'Nguyen'
    ).content as ReturnedToken;
    const quiz2 = adminQuizCreate(
      user2,
      'New Quiz 2',
      'long description'
    ).content as Quiz;

    const result = adminQuizInfo(user, quiz2.quizId);
    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
    });
  });

  test('Success: Quiz Information Retrieved:', () => {
    expect(adminQuizInfo(user, quiz.quizId).content).toStrictEqual({
      quizId: quiz.quizId,
      name: 'New Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'description',

      // these last three properties need to be d after implementing Question create function
      questions: [],
      numQuestions: 0,
      duration: 0,
      thumbnailUrl: ''
    });
  });

  test('Success: More Quiz Retrieved:', () => {
    const user2 = adminAuthRegister(
      'thang@gmail.com',
      '0105uwuwuw',
      'Thomas',
      'Nguyen'
    ).content as ReturnedToken;
    const quiz2 = adminQuizCreate(
      user2,
      'New Quiz 2',
      'long description'
    ).content as Quiz;
    const result = adminQuizInfo(user2, quiz2.quizId);
    expect(result.content).toStrictEqual({
      quizId: quiz2.quizId,
      name: 'New Quiz 2',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'long description',

      // these last three properties need to be tested after implementing Question create function
      questions: [],
      numQuestions: 0,
      duration: 0,
      thumbnailUrl: ''
    });
    expect(result.statusCode).toStrictEqual(200);
  });
});
