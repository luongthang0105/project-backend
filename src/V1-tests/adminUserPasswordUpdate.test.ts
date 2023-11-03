import { adminUserPasswordUpdate, adminAuthRegister } from '../testWrappersV1';
import { clear } from '../other';
import { ReturnedToken } from '../types';

describe('adminUserPasswordUpdate', () => {
  let validToken: ReturnedToken;

  beforeEach(() => {
    clear();
    validToken = adminAuthRegister(
      'ryan@gmail.com',
      'Password2314',
      'Ryan',
      'Huynh'
    ).content as ReturnedToken;
  });

  const invalidToken = {
    token: '-1'
  };

  test('Error: Token is empty or invalid (does not refer to valid logged in user session)', () => {
    expect(
      adminUserPasswordUpdate(invalidToken, 'Password2314', 'password3294')
    ).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)'
      },
      statusCode: 401
    });
  });

  test('Error: Old Password is not the correct old password', () => {
    expect(
      adminUserPasswordUpdate(validToken, 'Password2156', 'password3294')
    ).toStrictEqual({
      content: {
        error:
          'Old Password is not the correct old password'
      },
      statusCode: 400
    });
  });

  test('Error: Old Password and New Password match exactly', () => {
    expect(
      adminUserPasswordUpdate(validToken, 'Password2314', 'Password2314')
    ).toStrictEqual({
      content: {
        error:
          'Old Password and New Password match exactly'
      },
      statusCode: 400
    });
  });

  test('Error: New Password has already been used before by this user', () => {
    expect(
      adminUserPasswordUpdate(validToken, 'Password2314', 'password3294')
    ).toStrictEqual({
      content: {},
      statusCode: 200
    });

    expect(
      adminUserPasswordUpdate(validToken, 'password3294', 'Password2314')
    ).toStrictEqual({
      content: {
        error:
          'New Password has already been used before by this user'
      },
      statusCode: 400
    });

    expect(
      adminUserPasswordUpdate(validToken, 'password3294', 'password6841')
    ).toStrictEqual({
      content: {},
      statusCode: 200
    });

    expect(
      adminUserPasswordUpdate(validToken, 'password6841', 'password3294')
    ).toStrictEqual({
      content: {
        error:
          'New Password has already been used before by this user'
      },
      statusCode: 400
    });

    expect(
      adminUserPasswordUpdate(validToken, 'password6841', 'Password2314')
    ).toStrictEqual({
      content: {
        error:
          'New Password has already been used before by this user'
      },
      statusCode: 400
    });
  });

  test('Error: New Password is less than 8 characters', () => {
    expect(
      adminUserPasswordUpdate(validToken, 'Password2314', 'pas3294')
    ).toStrictEqual({
      content: {
        error:
          'New Password is less than 8 characters'
      },
      statusCode: 400
    });
  });

  test('Error: New Password does not contain at least one number and at least one letter, only letters case', () => {
    expect(
      adminUserPasswordUpdate(validToken, 'Password2314', 'realpassword')
    ).toStrictEqual({
      content: {
        error:
          'New Password does not contain at least one number and at least one letter'
      },
      statusCode: 400
    });
  });

  test('Error: New Password does not contain at least one number and at least one letter, only numbers case', () => {
    expect(
      adminUserPasswordUpdate(validToken, 'Password2314', '123456789')
    ).toStrictEqual({
      content: {
        error:
          'New Password does not contain at least one number and at least one letter'
      },
      statusCode: 400
    });
  });

  test('Success: successfully change password', () => {
    expect(
      adminUserPasswordUpdate(validToken, 'Password2314', 'password3294')
    ).toStrictEqual({
      content: {},
      statusCode: 200
    });
  });
});
