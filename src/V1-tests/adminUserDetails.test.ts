import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  clear
} from '../testWrappers';
import { ReturnedToken } from '../types';

describe('adminUserDetails', () => {
  let user1: ReturnedToken;

  beforeEach(() => {
    clear();
    user1 = adminAuthRegister(
      'javascript@gmail.com',
      'aikfnrg7',
      'Java',
      'Script'
    ).content as ReturnedToken;
  });

  const invalidToken = {
    token: '-1'
  };
  test('ERROR: Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const error = adminUserDetails(invalidToken);
    expect(error).toEqual({ statusCode: 401, content: { error: 'Token is empty or invalid (does not refer to valid logged in user session)' } });
  });

  test('SUCCESS: Registeration', () => {
    const success = adminUserDetails(user1).content;
    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });
  test('SUCCESS: Registeration => Successful Login', () => {
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7');

    const success = adminUserDetails(user1).content;

    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });
  test('SUCCESS: Registeration => Successful Login => Incorrect Password', () => {
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7');
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    const success = adminUserDetails(user1).content;
    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 1,
      },
    });
  });
  test('SUCCESS: Registeration => Incorrect Password', () => {
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    const success = adminUserDetails(user1).content;
    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 1,
      },
    });
  });
  test('SUCCESS: Registeration => Incorrect Password => Successful Login', () => {
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7');
    const success = adminUserDetails(user1).content;
    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });
  test('SUCCESS: Registeration => Incorrect Password => Successful Login => Incorrect Password', () => {
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7');
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    const success = adminUserDetails(user1).content;
    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 1,
      },
    });
  });
  test('SUCCESS: Registeration => Successful Login => Successful Login', () => {
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7');
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7');
    const success = adminUserDetails(user1).content;
    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });
  test('SUCCESS: Registeration => Incorrect Password => Incorrect Password', () => {
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    const success = adminUserDetails(user1).content;
    expect(success).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Java Script',
        email: 'javascript@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 2,
      },
    });
  });
});
