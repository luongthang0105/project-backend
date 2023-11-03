import { adminAuthRegister } from '../testWrappersV1';
import { adminQuizCreate } from '../testWrappersV2';
import { clear } from '../other';
import { ReturnedToken } from '../types';
beforeEach(() => {
  clear();
});

describe('adminQuizCreate', () => {
  const invalidToken = {
    token: '-1',
  };
  test('AuthUserId is not a valid user: dataStore is empty', () => {
    expect(
      adminQuizCreate(invalidToken, 'Hayden', 'This is my quiz')
    ).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('AuthUserId is not a valid user: dataStore has 1 user', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(user.token).toStrictEqual(expect.any(String));
    expect(
      adminQuizCreate(invalidToken, 'Hayden', 'This is my quiz')
    ).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore has 2 users', () => {
    const user1 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(user1.token).toStrictEqual(expect.any(String));

    const user2 = adminAuthRegister(
      'hanh@gmai.com',
      '2705uwuwuwuwuwuwuu',
      'Hanh',
      'Han'
    ).content as ReturnedToken;
    expect(user2.token).toStrictEqual(expect.any(String));

    expect(
      adminQuizCreate(invalidToken, 'Hayden', 'This is my quiz')
    ).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Name contains invalid characters: mixed with letters and special character', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(adminQuizCreate(user, 'Han Hanh!', 'This is my quiz')).toStrictEqual(
      {
        content: { error: 'Name contains invalid characters' },
        statusCode: 400,
      }
    );
  });

  test('Name contains invalid characters: only special characters', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, '----', 'This is my quiz')
    ).toStrictEqual({
      content: { error: 'Name contains invalid characters' },
      statusCode: 400,
    });
  });

  test('Name contains invalid characters: mixed with numbers and special characters', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, '1234+', 'This is my quiz')
    ).toStrictEqual({
      content: { error: 'Name contains invalid characters' },
      statusCode: 400,
    });
  });

  test('Name is less than 3 characters long: with only letters', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, 'Hi', 'This is my quiz')
    ).toStrictEqual({
      content:
      { error: 'Name is less than 3 characters long' },
      statusCode: 400
    });
  });

  test('Name is less than 3 characters long: with only number', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, '1', 'This is my quiz')
    ).toStrictEqual({

      content: { error: 'Name is less than 3 characters long' },
      statusCode: 400

    });
  });

  test('Name is less than 3 characters long: mixed with number and letter', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, '1H', 'This is my quiz')
    ).toStrictEqual({
      content:
      { error: 'Name is less than 3 characters long' },
      statusCode: 400

    });
  });

  test('Name is less than 3 characters long: empty string', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, '', 'This is my quiz')
    ).toStrictEqual({
      content:
      { error: 'Name is less than 3 characters long' },
      statusCode: 400

    });
  });

  test('Name is more than 30 characters long', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(
        user,
        'okiokiokiokiokiokiokiokiokiokioki',
        'This is my quiz'
      )
    ).toStrictEqual({
      content:
      { error: 'Name is more than 30 characters long' },
      statusCode: 400

    });
  });

  test('Name is already used by the current logged in user for another quiz', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    adminQuizCreate(user, 'quiz', 'This is my quiz');
    expect(
      adminQuizCreate(user, 'quiz', 'This is my quiz')
    ).toStrictEqual({
      content:
      {
        error:
        'Name is already used by the current logged in user for another quiz'
      },
      statusCode: 400

    });
  });

  test('Description is more than 100 characters in length', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(
        user,
        'Han',
        'Llllorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu'
      )
    ).toStrictEqual({

      content: { error: 'Description is more than 100 characters in length' },
      statusCode: 400

    });
  });

  test('Success: case01: name contains only letters', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, 'Han', 'This is my quiz')
    ).toStrictEqual({

      content: { quizId: expect.any(Number) },
      statusCode: 200
    });
  });

  test('Success: case02: name is mixed with letters and numbers', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, 'Han123', 'This is my quiz')
    ).toStrictEqual({

      content: { quizId: expect.any(Number) },
      statusCode: 200

    });
  });

  test('Success: case03: name is mixed with letters, numbers and spaces', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(
      adminQuizCreate(user, 'Han 34 uwu', 'This is my quiz')
    ).toStrictEqual({

      content: { quizId: expect.any(Number) },
      statusCode: 200

    });
  });

  test('Success: case04: description is an empty string', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    expect(adminQuizCreate(user, 'Han', '')).toStrictEqual({

      content: { quizId: expect.any(Number) },
      statusCode: 200

    });
  });

  test('Success: case05: one user with 2 quizzes', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    adminQuizCreate(user, 'Huhu', '');
    expect(adminQuizCreate(user, 'Han', '')).toStrictEqual({

      content: { quizId: expect.any(Number) },
      statusCode: 200

    });
  });

  test('Success: case06: 2 users, with one 1 quiz for each', () => {
    const user01 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const user02 = adminAuthRegister(
      'hanh@gmai.com',
      '2705uwuwuwuwuwuwu',
      'Hanh',
      'Han'
    ).content as ReturnedToken;
    adminQuizCreate(user01, 'Huhu', '');
    expect(adminQuizCreate(user02, 'Han', '')).toStrictEqual({

      content: { quizId: expect.any(Number) },
      statusCode: 200

    });
  });

  test('Success: case07: 2 users, 1 quiz for each (with the same name, same description)', () => {
    const user01 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const user02 = adminAuthRegister(
      'hanh@gmai.com',
      '2705uwuwuwuwuwuwu',
      'Hanh',
      'Han'
    ).content as ReturnedToken;
    adminQuizCreate(user01, 'Han', '');
    expect(adminQuizCreate(user02, 'Han', '')).toStrictEqual({
      content: { quizId: expect.any(Number) },
      statusCode: 200
    });
  });
});
