import {
  adminQuizCreate,
  adminAuthRegister,
  clear,
  adminQuizViewSessions,
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';

let user1: ReturnedToken;
let quiz1: Quiz;

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
      content: { error: 'Valid token is provided, but user is not an owner of this quiz' },
      statusCode: 403,
    });
  });

  //   test("Successful case: view active and inactive sessions", () => {
  //     const session1 = adminQuizSessionStart(user1, quiz1.quizId, 2).content.sessionId;
  //     const session2 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
  //     // need to add case where we can update the session state
  //     const result = adminQuizViewSessions(user1, quiz2.quizId);
  //     expect(result).toStrictEqual({
  //       content: "Valid token is provided, but user is not an owner of this quiz",
  //       statusCode: 403,
  //     });
  //   });
});
