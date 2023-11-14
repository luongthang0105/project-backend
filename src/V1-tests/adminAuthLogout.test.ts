import {
  adminAuthRegister,
  adminAuthLogout,
  adminQuizCreate,
  adminAuthLogin,
  clear
} from '../testWrappersV1';
import { ReturnedToken } from '../types';

describe('adminAuthLogout', () => {
  let user: ReturnedToken;
  beforeEach(() => {
    clear();
    user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
      .content as ReturnedToken;
  });

  test('Successfully logout: dataStore has 1 user', () => {
    const result = adminAuthLogout(user);

    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const quiz = adminQuizCreate(user, 'New Quiz', 'I love Aespa');

    expect(quiz).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Successfully logout: dataStore has 2 users', () => {
    // log out user
    const result = adminAuthLogout(user);

    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    // log in user01
    const user01 = adminAuthRegister('hanhhh@gmai.com', '2705uwuwuwuwuwuwuuu', 'Ka', 'Rina')
      .content as ReturnedToken;

    // log out user01
    const result2 = adminAuthLogout(user01);
    expect(result2).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    // create a quiz in user01
    const quiz = adminQuizCreate(user01, 'New Quiz', 'I love Aespa');
    expect(quiz).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });

    // login user01
    const loginUser01 = adminAuthLogin('han@gmai.com', '2705uwuwuwuwuwuw');

    expect(loginUser01).toStrictEqual({
      content: {
        token: expect.any(String)
      },
      statusCode: 200
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const invalidToken = {
      token: '-1',
    };
    const result = adminAuthLogout(invalidToken);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });
});
