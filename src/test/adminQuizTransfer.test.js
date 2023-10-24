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

  let user1 = adminAuthRegister(
    "ryan@gmail.com",
    "password3213",
    "Ryan",
    "Huynh"
  ).content;

  let quiz = adminQuizCreate(
    user1,
    "quiz",
    "description"
  ).content

  let user2 = adminAuthRegister(
    "oth@gmail.com",
    "password4876",
    "oth",
    "other"
  ).content

  let validBody = {
    token: user1,
    userEmail: user2.email
  }

  test("Token is empty or invalid (does not refer to valid logged in user session)", () => {
    let body = {
      token: invalidToken,
      userEmail: user2.email
    }
    expect(
      adminQuizTransfer(quiz, body)
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
    let body2 = {
      token: user3,
      userEmail: user2.email
    }

    expect(adminQuizTransfer(quiz, body2)).toStrictEqual({
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
      statusCode: 403,
    });
  });

  test("userEmail is not a real user", () => {
  let body3 = {
    token: user1,
    userEmail: "no@gmail.com"
  }
    expect(
      adminQuizTransfer(quiz, body3)
    ).toStrictEqual({
      content: {
        error: "userEmail is not a real user"
      },
      statusCode: 400,
    })
  })

  test("userEmail is the current logged in user", () => {
    let currlog = adminAuthLogin("ryan@gmail.com", "password3213")
    let body4 = {
      token: currlog,
      userEmail: user2.email
    }

    expect(
      adminQuizTransfer(quiz, body4)
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

    expect(adminQuizTransfer(quiz2, validBody)).toStrictEqual({
      content: {
        error: "Quiz ID refers to a quiz that has a name that is already used by the target user"
      },
      statusCode: 400,
    })
  })

  test("All sessions for this quiz must be in END state", () => {


    expect(adminQuizTransfer(quiz, validBody)).toStrictEqual({
      content: {
        error: "All sessions for this quiz must be in END state"
      },
      statusCode: 400,
    })
  })

  test("Success", () => {
    expect(adminQuizTransfer(quiz, validBody)).toStrictEqual({
      content: {},
      statusCode: 200
    })
  })
})