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

    const quiz2 = adminQuizCreate(user2, "New Quiz 2", "long description")
      .content as Quiz;

    const result = adminQuizMoveQuestion(
      user,
      quiz2.quizId,
      question.questionId,
      0
    );
    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
    });
  });

  test("Success case: move the question", () => {
    const questInfo2 = {
      question: "What is that character",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Loopy",
          correct: true,
        },
        {
          answer: "Thomas",
          correct: false,
        },
      ],
    };
    const question02 = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers
    ).content as Question;

    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question.questionId,
      1
    );
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {},
    });

    const quizInfo = adminQuizInfo(user, quiz.quizId).content as QuizObject;

    expect(quizInfo.questions[0].questionId).toStrictEqual(question02.questionId);
    expect(quizInfo.questions[1].questionId).toStrictEqual(question.questionId);
  });

  test("Success case2: order from 0-1-2 to 2-0-1", () => {
    const questInfo2 = {
      question: "What is that character",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Loopy",
          correct: true,
        },
        {
          answer: "Thomas",
          correct: false,
        },
      ],
    };
    const question02 = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers
    ).content as Question;

    const questInfo3 = {
      question: "What is that player",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Eden Hazard",
          correct: true,
        },
        {
          answer: "Thomas",
          correct: false,
        },
      ],
    };
    const question03 = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo3.question,
      questInfo3.duration,
      questInfo3.points,
      questInfo3.answers
    ).content as Question;

    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question03.questionId,
      0
    );
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {},
    });
    
    const quizInfo = adminQuizInfo(user, quiz.quizId).content as QuizObject;

    expect(quizInfo.questions[0].questionId).toStrictEqual(question03.questionId);
    expect(quizInfo.questions[1].questionId).toStrictEqual(question.questionId);
    expect(quizInfo.questions[2].questionId).toStrictEqual(question02.questionId);
  });

  test("Success case2: order from 0-1-2 to 2-0-1", () => {
    const questInfo2 = {
      question: "What is that character",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Loopy",
          correct: true,
        },
        {
          answer: "Thomas",
          correct: false,
        },
      ],
    };
    const question02 = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers
    ).content as Question;

    const questInfo3 = {
      question: "What is that player",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Eden Hazard",
          correct: true,
        },
        {
          answer: "Thomas",
          correct: false,
        },
      ],
    };
    const question03 = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo3.question,
      questInfo3.duration,
      questInfo3.points,
      questInfo3.answers
    ).content as Question;


    const questInfo4 = {
      question: "What is that fruit",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Apple",
          correct: true,
        },
        {
          answer: "Thomas",
          correct: false,
        },
      ],
    };
    const question04 = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo4.question,
      questInfo4.duration,
      questInfo4.points,
      questInfo4.answers
    ).content as Question;

    const result = adminQuizMoveQuestion(
      user,
      quiz.quizId,
      question04.questionId,
      1
    );
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {},
    });
    
    const quizInfo = adminQuizInfo(user, quiz.quizId).content as QuizObject;
    // from 0-1-2-3 to 0-3-1-2
    expect(quizInfo.questions[0].questionId).toStrictEqual(question.questionId);
    expect(quizInfo.questions[1].questionId).toStrictEqual(question04.questionId);
    expect(quizInfo.questions[2].questionId).toStrictEqual(question02.questionId);
    expect(quizInfo.questions[3].questionId).toStrictEqual(question03.questionId);
    
  });
});
