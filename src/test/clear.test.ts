import { adminAuthRegister, adminAuthLogin, clear } from '../testWrappers';
import { ReturnedToken } from '../types';

describe('clear', () => {
  beforeEach(() => {
    clear();
  });

  test('Success: Can not login after clear', () => {
    const user1 = adminAuthRegister(
      'javascript@gmail.com',
      'aikfnrg7',
      'Java',
      'Script'
    ).content as ReturnedToken;
    expect(user1.token).toStrictEqual(expect.any(String));

    const loginRet = adminAuthLogin('javascript@gmail.com', 'aikfnrg7').content as ReturnedToken;
    expect(loginRet.token).toStrictEqual(expect.any(String));

    const result = clear();
    expect(result.content).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
    expect(
      adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    ).toStrictEqual({
      content: { error: 'Email adress does not exist' },
      statusCode: 400
    });
  });
});
