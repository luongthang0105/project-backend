import {
  adminAuthRegister,
  adminUserDetails,
  adminUserDetailsUpdate
} from '../testWrappers';
import { ReturnedToken, UserDetails } from '../types';
import { clear } from '../other';

describe('adminUserDetailsUpdate', () => {
  let user: ReturnedToken;
  let user2: ReturnedToken;
  beforeEach(() => {
    clear();
    user = adminAuthRegister(
      'javascript@gmail.com',
      'luongthang0105',
      'Java',
      'Script'
    ).content as ReturnedToken;
    user2 = adminAuthRegister(
      'javascript1@yahoo.com',
      'luongthang0105',
      'Jay',
      'Ess'
    ).content as ReturnedToken;
    expect(user2.token).toStrictEqual(expect.any(String));
  });
  test('Success: successfully update user details', () => {
    const email = 'newjavascript@gmail.com';
    const nameFirst = 'NewJava';
    const nameLast = 'NewScript';
    const result = adminUserDetailsUpdate(user, email, nameFirst, nameLast);
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    const userDetails = (adminUserDetails(user).content as UserDetails).user;
    expect(userDetails.name).toEqual('NewJava NewScript');
    expect(userDetails.email).toEqual('newjavascript@gmail.com');
  });

  test('Error: Email is currently used by another user (excluding the current authorised user)', () => {
    const email2 = 'javascript1@yahoo.com';
    const nameFirst = 'NewJava';
    const nameLast = 'NewScript';

    const result = adminUserDetailsUpdate(user, email2, nameFirst, nameLast);

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'Email is currently used by another user (excluding the current authorised user)'
      }
    });
  });
  test('Error: Invalid email address', () => {
    const email = 'javascript@';
    const nameFirst = 'NewJava';
    const nameLast = 'NewScript';
    const result = adminUserDetailsUpdate(user, email, nameFirst, nameLast);
    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'Invalid email address'
      }
    });
  });
  test('Error: First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
    const email = 'newjavascript@gmail.com';
    const nameFirst = 'Jav@';
    const nameLast = 'Script';
    const result = adminUserDetailsUpdate(user, email, nameFirst, nameLast);

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'
      }
    });
  });
  test('Error: First name is less than 2 characters or more than 20 characters', () => {
    const email = 'newjavascript@gmail.com';
    const nameFirstTooShort = 'J';
    const nameFirstTooLong = 'Javahefuehfehfaklwnfsjehf';
    const nameLast = 'Script';

    const result = adminUserDetailsUpdate(user, email, nameFirstTooShort, nameLast);
    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'First name is less than 2 characters or more than 20 characters'
      }
    });

    const result2 = adminUserDetailsUpdate(user, email, nameFirstTooLong, nameLast);
    expect(result2).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'First name is less than 2 characters or more than 20 characters'
      }
    });
  });
  test('Error: Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
    const email = 'newjavascript@gmail.com';
    const nameFirst = 'Java';
    const nameLast = 'Scrip%2';
    const result = adminUserDetailsUpdate(user, email, nameFirst, nameLast);

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'
      }
    });
  });
  test('Error: Last name is less than 2 characters or more than 20 characters', () => {
    const email = 'newjavascript@gmail.com';
    const nameFirst = 'Java';
    const nameLastTooShort = 'S';
    const nameLastTooLong = 'Scekfhjoeuwheowthweoufthqd';

    const result = adminUserDetailsUpdate(user, email, nameFirst, nameLastTooLong);
    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'Last name is less than 2 characters or more than 20 characters'
      }
    });

    const result2 = adminUserDetailsUpdate(user, email, nameFirst, nameLastTooShort);
    expect(result2).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'Last name is less than 2 characters or more than 20 characters'
      }
    });
  });

  test('Error: Token is invalid or empty', () => {
    const invalidToken = {
      token: '-1'
    };
    const email = 'newjavascript@gmail.com';
    const nameFirst = 'Jav';
    const nameLast = 'Script';
    const result = adminUserDetailsUpdate(invalidToken, email, nameFirst, nameLast);

    expect(result.statusCode).toBe(401);
    expect(result.content.error).toEqual('Token is empty or invalid (does not refer to valid logged in user session)');
  });
});
