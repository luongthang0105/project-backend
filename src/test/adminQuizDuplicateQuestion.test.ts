import {
  adminQuizCreate,
  adminAuthRegister,
  clear,
  adminQuizCreateQuestion,
  adminQuizInfo,
  adminQuizDuplicateQuestion,
} from "../testWrappers";
import { Question, Quiz, QuizObject, ReturnedToken } from "../types";

import { expect, test } from "@jest/globals";

describe("adminQuizDuplicateQuestion", () => {
  let user: ReturnedToken;
  let quiz: Quiz;
  let questInfo: Question;
  let question: Question;
  beforeEach(() => {
    clear();
    user = adminAuthRegister("han@gmai.com", "2705uwuwuwu", "Han", "Hanh")
      .content as ReturnedToken;
    quiz = adminQuizCreate(user, "Quiz 1", "Description").content as Quiz;
    questInfo = {
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

    const result = adminQuizDuplicateQuestion(
      invalidToken,
      quiz.quizId,
      question.questionId
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
    const result = adminQuizDuplicateQuestion(
      user,
      quiz.quizId,
      question.questionId + 1
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error:
          "Question Id does not refer to a valid question within this quiz",
      },
    });
  });

  test("Valid token is provided, but user is not an owner of this quiz", () => {
    const user2 = adminAuthRegister(
      "thang@gmail.com",
      "0105uwuwuw",
      "Thomas",
      "Nguyen"
    ).content as ReturnedToken;

    const quiz2 = adminQuizCreate(user2, "New Quiz 2", "long description")
      .content as Quiz;

    const result = adminQuizDuplicateQuestion(
      user,
      quiz2.quizId,
      question.questionId
    );
    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
    });
  });

  test("Success case: duplicate 1 question", () => {
    const result = adminQuizDuplicateQuestion(
      user,
      quiz.quizId,
      question.questionId
    );

    expect(result).toStrictEqual({
      statusCode: 200,
      content: {
        newQuestionId: 1,
      },
    });

    const quizInfo = adminQuizInfo(user, quiz.quizId).content as QuizObject;
    console.log(quizInfo)
    expect(quizInfo.numQuestions).toBe(2);
    expect(quizInfo.duration).toBe(8);
    expect(quizInfo.questions[0].answers).toStrictEqual(quizInfo.questions[1].answers);
    expect(quizInfo.questions[0].points).toStrictEqual(quizInfo.questions[1].points);
    expect(quizInfo.questions[0].question).toStrictEqual(quizInfo.questions[1].question);
    expect(quizInfo.questions[0].duration).toStrictEqual(quizInfo.questions[1].duration);
  });
});
