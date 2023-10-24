import { adminUserPassword, adminAuthRegister } from "../testWrappers";
import { clear } from "../other";
beforeEach(() => {
  clear();
});

describe("adminUserPassword", () => {
  let invalidToken = {
    token: "-1"
  }

	const validToken = adminAuthRegister(
		"ryan@gmail.com",
		"Password2156",
		"Ryan",
		"Huynh"
	).content

  test("Token is empty or invalid (does not refer to valid logged in user session)", () => {
    expect(
      adminUserPassword(invalidToken, "Password2314", "password3294")
    ).toStrictEqual({
      content: {
        error:
          "Token is empty or invalid (does not refer to valid logged in user session)"
      },
			statusCode: 401
    })
  })

	test("Old Password is not the correct old password", () => {
    expect(
      adminUserPassword(validToken, "Password2314", "password3294")
    ).toStrictEqual({
      content: {
        error:
          "Old Password is not the correct old password"
      },
			statusCode: 400
    })
  })

	test("Old Password and New Password match exactly", () => {
    expect(
      adminUserPassword(validToken, "Password2314", "Password2314")
    ).toStrictEqual({
      content: {
        error:
          "Old Password and New Password match exactly"
      },
			statusCode: 400
    })
  })

	test("New Password has already been used before by this user", () => {
    expect(
      adminUserPassword(validToken, "Password2314", "password3294")
    ).toStrictEqual({
      content: {
        error:
          "New Password has already been used before by this user"
      },
			statusCode: 400
    })
  })

	test("New Password is less than 8 characters", () => {
    expect(
      adminUserPassword(validToken, "Password2314", "pas3294")
    ).toStrictEqual({
      content: {
        error:
          "New Password is less than 8 characters"
      },
			statusCode: 400
    })
  })

	test("New Password does not contain at least one number and at least one letter", () => {
    expect(
      adminUserPassword(validToken, "Password2314", "realpassword")
    ).toStrictEqual({
      content: {
        error:
          "New Password does not contain at least one number"
      },
			statusCode: 400
    })
  })

	test("New Password does not contain at least one number and at least one letter", () => {
    expect(
      adminUserPassword(validToken, "Password2314", "123456789")
    ).toStrictEqual({
      content: {
        error:
          "New Password does not contain at least one letter"
      },
			statusCode: 400
    })
  })

	test("Success", () => {
    expect(
      adminUserPassword(validToken, "Password2314", "password3294")
    ).toStrictEqual({
      content: {},
			statusCode: 200
    })
  })
})