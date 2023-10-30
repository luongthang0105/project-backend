import { adminAuthRegister, adminAuthLogin, clear } from '../testWrappers';

describe('clear', () => {
  beforeEach(() => {
    clear();
  });

  test('Success: Can not login after clear', () => {
    // eslint-disable-next-line
    adminAuthRegister(
      'javascript@gmail.com',
      'aikfnrg7',
      'Java',
      'Script'
    ).content;

    // eslint-disable-next-line
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7').content;
    const result = clear();
    expect(result.content).toStrictEqual({});
    expect(result.statusCode).toBe(200);
    expect(
      adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    ).toStrictEqual({
      content: { error: 'Email adress does not exist' },
      statusCode: 400
    });
  });
});
