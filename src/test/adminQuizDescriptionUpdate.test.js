import {
  adminQuizDescriptionUpdate,
  adminAuthRegister,
  adminQuizInfo,
  adminQuizCreate,
  clear,
} from "../testWrappers";

describe("adminQuizDescriptionUpdate", () => {
  let user, quiz;
  let invalidToken = {
    token: "-1",
  };
  beforeEach(() => {
    clear();
    user = adminAuthRegister("han@gmai.com", "2705uwuwuwu", "Han", "Hanh");
    quiz = adminQuizCreate(user.token, "New Quiz", "description");
  });

  test("Token is empty or invalid (does not refer to valid logged in user session)", () => {
    const result = adminQuizDescriptionUpdate(
      invalidToken,
      quiz.quizId,
      "New description"
    );
    expect(result).toStrictEqual({
      content: "Token is empty or invalid (does not refer to valid logged in user session)",
      statusCode: 401,
    });
  });

  test("Quiz ID does not refer to a valid quiz", () => {
    const result3 = adminQuizDescriptionUpdate(
      user.token,
      quiz.quizId + 1,
      "Description"
    );
    expect(result3).toStrictEqual({
      content: "Quiz ID does not refer to a valid quiz",
      statusCode: 400,
    });
  });

  test("Valid token is provided, but user is not an owner of this quiz	", () => {
    let user2 = adminAuthRegister(
      "thang@gmail.com",
      "0105uwuwuw",
      "Thomas",
      "Nguyen"
    );
    let quiz2 = adminQuizCreate(user2.token, "New Quiz 2", "long description");

    const result2 = adminQuizDescriptionUpdate(
      user.token,
      quiz2.quizId,
      "Description"
    );
    expect(result2).toStrictEqual({
      content: "Valid token is provided, but user is not an owner of this quiz",
      statusCode: 403,
    });
  });

  test("Description is more than 100 characters in length", () => {
    const oldDescription = adminQuizInfo(user.token, quiz.quizId).description;
    // 105 characters
    const newDescription =
      "okidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidoki.";

    const result = adminQuizDescriptionUpdate(
      user.token,
      quiz.quizId,
      newDescription
    );
    expect(result).toEqual({
      content: "Description is more than 100 characters in length",
      statusCode: 400,
    });

    let quizInfo = adminQuizInfo(user.token, quiz.quizId);
    expect(quizInfo.content.description).toStrictEqual(oldDescription);
  });
  
  test("Success case: check different timestamps", () => {
    expect(
      adminQuizDescriptionUpdate(user.token, quiz.quizId, "New description")
    ).toStrictEqual({ content: {}, statusCode: 200 });

    let quizInfo = adminQuizInfo(user.token, quiz.quizId);
    expect(quizInfo.content.description).toStrictEqual("New description");
    expect(quizInfo.content.timeCreated).toBeLessThanOrEqual(
      quizInfo.timeLastEdited
    );
  });
  test("Success case: Empty Description", () => {
    expect(
      adminQuizDescriptionUpdate(user.token, quiz.quizId, "")
    ).toStrictEqual({ content: {}, statusCode: 200 });

    let quizInfo = adminQuizInfo(user.token, quiz.quizId);
    expect(quizInfo.content.description).toStrictEqual("");
    expect(quizInfo.content.timeCreated).toBeLessThanOrEqual(
      quizInfo.timeLastEdited
    );
  });
});
