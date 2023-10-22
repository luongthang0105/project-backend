import {
  adminQuizInfo,
  adminQuizCreate,
  adminAuthRegister,
  clear,
} from "../testWrappers";

describe("adminQuizInfo", () => {
  beforeEach(() => {
    clear();
    let user, quiz;
    user = adminAuthRegister(
      "han@gmai.com",
      "2705uwuwuwu",
      "Han",
      "Hanh"
    ).content;


    quiz = adminQuizCreate(
      user,
      "New Quiz",
      "description"
    ).content;
    
  });
  test("Token is empty or invalid (does not refer to valid logged in user session)", () => {
    let invalidToken = {
      token: "-1",
    };

    let result = adminQuizInfo(invalidToken, quiz.quizId);
    expect(result).toStrictEqual({
      statusCode: 401,
      content: {
        error:
          "Token is empty or invalid (does not refer to valid logged in user session)",
      },
    });
  });

  test("Quiz ID does not refer to a valid quiz", () => {

    const result = adminQuizInfo(user, quiz.quizId + 1);
    
    expect(result).toStrictEqual({
      statusCode: 400,
      content: { error: "Quiz ID does not refer to a valid quiz" },
    });
  });

  test("Valid token is provided, but user is not an owner of this quiz", () => {
    let user2 = adminAuthRegister(
      "thang@gmail.com",
      "0105uwuwuw",
      "Thomas",
      "Nguyen"
    ).content;
    let quiz2 = adminQuizCreate(
      user2,
      "New Quiz 2",
      "long description"
    ).content;

    const result = adminQuizInfo(user, quiz2.quizId).content;

    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
    });
  });

  test("Success: Quiz Information Retrieved:", () => {
    expect(adminQuizInfo(user, quiz.quizId)).toStrictEqual({
      quizId: quiz.quizId,
      name: "New Quiz",
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: "description",

      // these last three properties need to be tested after implementing Question create function
      questions: [],
      numQuestions: 0,
      duration: 0,
    });
  });

  test("Success: More Quiz Retrieved:", () => {
    let user2 = adminAuthRegister(
      "thang@gmail.com",
      "0105uwuwuw",
      "Thomas",
      "Nguyen"
    ).content;
    let quiz2 = adminQuizCreate(
      user2,
      "New Quiz 2",
      "long description"
    ).content;
    let result = adminQuizInfo(user2, quiz2.quizId);
    expect(result.content).toStrictEqual({
      error: {
        quizId: quiz2.quizId,
        name: "New Quiz 2",
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: "long description",

        // these last three properties need to be tested after implementing Question create function
        questions: [],
        numQuestions: 0,
        duration: 0,
      },
    });
    expect(result.statusCode).toStrictEqual(200);
  });
});
