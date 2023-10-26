import {
  adminQuizMoveQuestion,
  adminQuizCreateQuestion,
  adminQuizCreate,
  adminAuthRegister,
  adminQuizInfo,
  clear,
} from "../testWrappers";
import { Question, Quiz, QuizObject, ReturnedToken } from "../types";
import { getCurrentTimestamp } from "../quizHelper";
import "./toHaveValidColour";
import { expect, test } from "@jest/globals";

describe("adminQuizRemoveQuestion", () => {
  let user: ReturnedToken;
  let quiz: Quiz;
  let question: Question;
  const questInfo = {
    question: "What is that pokemon",
    duration: 4,
    points: 5,
    answers: [
      {
        answer: "Pikachu",
        correct: true,
      },
      {
        answer: "Thomas",
        correct: false,
      },
    ],
  };
  beforeEach(() => {
    clear();
    user = adminAuthRegister("han@gmai.com", "2705uwuwuwu", "Han", "Hanh")
      .content as ReturnedToken;
    quiz = adminQuizCreate(user, "Quiz 1", "Description").content as QuizObject;
    question = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    ).content as Question;
  });

  test("Token is empty or invalid (does not refer to valid logged in user session)", () => {
    const invalidToken = {
      token: "-1",
    };
    const result = adminQuizMoveQuestion(
      invalidToken,
      quiz.quizId,
      question.questionId,
      1
    );
    expect(result).toStrictEqual({
      statusCode: 401,
      content: {
        error:
          "Token is empty or invalid (does not refer to valid logged in user session)",
      },
    });
  });

  test("Question ID does not refer to a valid question within this quiz", () => {
    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question.questionId + 1,
      1
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error:
          "Question Id does not refer to a valid question within this quiz",
      },
    });
  });

  test("NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions", () => {
    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question.questionId,
      -1
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error:
          "NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions",
      },
    });
  });

  test("NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions", () => {
    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question.questionId,
      1
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error:
          "NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions",
      },
    });
  });

  test("NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions", () => {
    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question.questionId,
      1
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error:
          "NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions",
      },
    });
  });

  test("NewPosition is the position of the current question", () => {
    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question.questionId,
      0
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: { error: "NewPosition is the position of the current question" },
    });
  });

  test("Valid token is provided, but user is not an owner of this quiz", () => {
    const user2 = adminAuthRegister(
      "thang@gmail.com",
      "0105uwuwuw",
      "Thomas",
      "Nguyen"
    ).content as ReturnedToken;

    const quiz2 = adminQuizCreate(
        user2,
        'New Quiz 2',
        'long description'
      ).content as Quiz;
  
    const result = adminQuizMoveQuestion(user, quiz2.quizId, question.questionId, 0);
    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
    });
  });
});
