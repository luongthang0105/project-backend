import { adminAuthRegister, adminAuthLogin } from "../auth";
import { clear } from "../other";

describe("clear", () => {
  beforeEach(() => {
    clear()
  })
  test("Success: Can't login after clear", () => {
    const userId1 = adminAuthRegister(
      "javascript@gmail.com",
      "aikfnrg7",
      "Java",
      "Script"
    );
    const success = adminAuthLogin("javascript@gmail.com", "aikfnrg7");
    expect(success).toEqual(userId1);

    expect(clear()).toStrictEqual({});

    expect(adminAuthLogin("javascript@gmail.com", "aikfnrg7")).toStrictEqual({
      error: "Email adress does not exist",
    });
  });
});