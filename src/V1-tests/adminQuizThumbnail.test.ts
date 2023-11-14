import {
  clear,
  adminAuthRegister,
  adminQuizThumbnail
} from '../testWrappersV1';

import {
  adminQuizCreate,
  adminQuizCreateQuestion
} from '../testWrappersV2';

import { expect, test } from '@jest/globals';
import { ReturnedToken, Quiz } from '../types';

describe('adminQuizThumbnail', () => {
  let user: ReturnedToken;
  let quiz: Quiz;

  beforeEach(() => {
    clear();
    user = adminAuthRegister('ryan@gmail.com', 'password4213', 'Ryan', 'Huynh').content as ReturnedToken;
    quiz = adminQuizCreate(user, 'quiz', 'description').content as Quiz;
  });

  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const invalidToken = {
      token: '-1'
    };
    const result = adminQuizThumbnail(invalidToken, quiz.quizId, 'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg');
    expect(result).toStrictEqual({
      statusCode: 401,
      content: {
        error: 'Token is empty or invalid (does not refer to valid logged in user session)'
      }
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = adminAuthRegister('nayr@gmail.com', 'password5213', 'Nayr', 'Hnyuh').content as ReturnedToken;
    const result = adminQuizThumbnail(user2, quiz.quizId, 'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg');
    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz'
      }
    });
  });

  test('The imgUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png', () => {
    const result = adminQuizThumbnail(user, quiz.quizId, 'https://i.pinimg.com/originals/57/61/5b/57615b8c0092a66c1d4058b1692955cc.gif');
    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'The imgUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png'
      }
    });
  });

  test('The thumbnailUrl does not begin with "http://" or "https://"', () => {
    const result = adminQuizThumbnail(user, quiz.quizId, 'htt://apcs.jpg');
    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'The thumbnailUrl does not begin with "http://" or "https://"'
      }
    });
  });

  test('SUCCESS', () => {
    const result = adminQuizThumbnail(user, quiz.quizId, 'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg');
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {}
    });
  });
});
