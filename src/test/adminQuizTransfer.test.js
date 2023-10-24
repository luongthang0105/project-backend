import {
  adminQuizTransfer,
  adminAuthRegister,
  adminAuthLogin,
  adminQuizCreate
} from "../testWrappers";
import { clear } from "../other";
beforeEach(() => {
  clear();
});

describe("adminUserPassword", () => {
  let invalidToken = {
    token: "-1"
  }

  let user = adminAuthRegister(
    "ryan@gmail.com",
    "password3213", 
    "Ryan",
    "Huynh"
  ).content;

  let quiz = adminQuizCreate(
    user,
    "quiz",
    "description"
  ).content

  let user2 = adminAuthRegister(
    "oth@gmail.com",
    "password4876",
    "oth",
    "other"
  ).content

  test("Token is empty or invalid (does not refer to valid logged in user session)", () => {
    expect(
      adminQuizTransfer(quiz, invalidToken, user2.email)
    ).toStrictEqual({
    content: {
      error:
        "Token is empty or invalid (does not refer to valid logged in user session)"
      },
      statusCode: 401
    })
  })

  test("Valid token is provided, but user is not an owner of this quiz", () => {
    let user3 = adminAuthRegister(
      "ran@mail.com",
      "dsadsadsa321",
      "Ran",
      "Huy"
    ).content;
    expect(adminQuizTransfer(quiz, user3, user2.email)).toStrictEqual({
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
      statusCode: 403,
    });
  });

  test("userEmail is not a real user", () => {
    expect(
      adminQuizTransfer(quiz, user, userEmail)
    ).toStrictEqual({
      content: {
        error: "userEmail is not a real user"
      },
      statusCode: 400,
    })
  })

  test("userEmail is the current logged in user", () => {
    expect(
      adminQuizTransfer(quiz, user, user.email)
    ).toStrictEqual({
      content: {
        error: "userEmail is the current logged in user"
      },
      statusCode: 400,
    })
  })

  test("Quiz ID refers to a quiz that has a name that is already used by the target user", () => {
    let quiz2 = adminQuizCreate(
      user2,
      "quiz",
      "description"
    ).content

    expect(adminQuizTransfer(quiz2, user, user2.email)).toStrictEqual({
      content: {
        error: "Quiz ID refers to a quiz that has a name that is already used by the target user"
      },
      statusCode: 400,
    })
  })

  // Not done
  test.skip("All sessions for this quiz must be in END state", () => {
    expect(adminQuizTransfer(quiz, user, user2.email)).toStrictEqual({
      content: {
        error: "All sessions for this quiz must be in END state"
      },
      statusCode: 400,
    })
  })

  test("Success", () => {
    expect(adminQuizTransfer(quiz, user, user2.email)).toStrictEqual({
      content: {},
      statusCode: 200
    })
  })
})