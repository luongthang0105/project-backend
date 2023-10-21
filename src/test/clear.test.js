import { adminAuthRegister, adminAuthLogin, clear } from "../testWrappers";

describe("clear", () => {
  beforeEach(() => {
    clear();
  });

  test("Success: Can't login after clear", () => {
    const userId1 = adminAuthRegister(
      "javascript@gmail.com",
      "aikfnrg7",
      "Java",
      "Script"
    ).content;
    const success = adminAuthLogin("javascript@gmail.com", "aikfnrg7").content;
    let result = clear();
    expect(result.content).toStrictEqual({});
    expect(result.statusCode).toBe(200);
    expect(
      adminAuthLogin("javascript@gmail.com", "aikfnrg7")
    ).toStrictEqual({
      content: {error: "Email adress does not exist"},
      statusCode: 400
    });
  });
});
