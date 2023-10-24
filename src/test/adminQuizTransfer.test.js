import {
  adminQuizTransfer,
  adminAuthRegister,
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

  let quiz = adminQuizCreate(user, "quiz", "description").content;

  const validToken = adminAuthRegister(
    "ryan@gmail.com",
    "Password2156",
    "Ryan",
    "Huynh"
  ).content

  let body = {
    token: validToken,
    description: "description"
  }
  
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

  test("Valid token is provided, but user is not an owner of this quiz", () => {
    let user2 = adminAuthRegister(
      "ran@mail.com",
      "dsadsadsa321",
      "Ran",
      "Huy"
    ).content;
    let quiz2 = adminQuizCreate(
      user2,
      "quiz",
      "description"
    ).content;

    expect(adminQuizTransfer(quiz, body)).toStrictEqual({
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
      statusCode: 403,
    });
  });

  test("Description is more than 100 characters in length (note: empty strings are OK)", () => {
    let body2 = {
      token: validToken,
      description: "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong"
    }

    expect(
      adminQuizTransfer(quiz, body2)
    ).toStrictEqual({
      content: {
        error: "Description is more than 100 characters in length"
      },
      statusCode: 400,
    })
  })

  test("Success", () => {
    expect(adminQuizTransfer(quiz, body)).toStrictEqual({
      content: {},
      statusCode: 200
    })
  })
})