import { adminAuthRegister, adminAuthLogin } from '../testWrappersV1';
import { clear } from '../other';
describe('adminAuthLogin', () => {
  beforeEach(() => {
    clear();
    const user = adminAuthRegister(
      'javascript@gmail.com',
      'aikfnrg7',
      'Java',
      'Script'
    );
    expect(user.statusCode).toEqual(200);
  });
  test('ERROR: Email address does not exist', () => {
    const error = adminAuthLogin('python@gmail.com', 'aikfnrg7');
    expect(error).toStrictEqual({
      statusCode: 400,
      content: { error: 'Email adress does not exist' },
    });
  });
  test('ERROR: Password is not correct for the given email', () => {
    const error = adminAuthLogin('javascript@gmail.com', 'aikfnrg8');
    expect(error).toStrictEqual({
      content: { error: 'Password is not correct for the given email' },
      statusCode: 400,
    });
  });
  test('ERROR: Password is case-insensitive', () => {
    const error = adminAuthLogin('javascript@gmail.com', 'Aikfnrg7');
    expect(error).toStrictEqual({
      content: { error: 'Password is not correct for the given email' },
      statusCode: 400,
    });
  });
  test('ERROR: No registration done', () => {
    const error = adminAuthLogin('java@gmail.com', 'gdnkgeg4');
    expect(error).toStrictEqual({
      statusCode: 400,
      content: { error: 'Email adress does not exist' },
    });
  });
  test('Success: 1 person registered', () => {
    const success = adminAuthLogin('javascript@gmail.com', 'aikfnrg7');
    expect(success).toStrictEqual({
      statusCode: 200,
      content: { token: expect.any(String) },
    });
  });
  test('Success: More than 1 person registered', () => {
    const user2 = adminAuthRegister(
      'java@gmail.com',
      'gdnkgeg4',
      'Hello',
      'World'
    );
    expect(user2).toStrictEqual({
      statusCode: 200,
      content: { token: expect.any(String) },
    });

    const success = adminAuthLogin('java@gmail.com', 'gdnkgeg4');
    expect(success).toStrictEqual({
      statusCode: 200,
      content: { token: expect.any(String) },
    });
  });
});
