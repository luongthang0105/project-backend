import { getCurrentTimestamp } from "../quizHelper"
import {
  adminQuizCreate,
  adminAuthRegister,
  clear,
  adminQuizCreateQuestion,
  adminQuizInfo,
  adminQuizQuestionUpdate,
} from "../testWrappers"
import { Question, Quiz, QuizObject, ReturnedToken } from "../types"

import "./toHaveValidColour"
import { expect, test } from "@jest/globals"

describe("adminQuizQuestionUpdate", () => {
  let user: ReturnedToken
  let quizId: number
  let questInfo: Question
  let questionId: number

  beforeEach(() => {
    clear()
    user = adminAuthRegister("han@gmai.com", "2705uwuwuwu", "Han", "Hanh")
      .content as ReturnedToken
    quizId = (adminQuizCreate(user, "Quiz 1", "Description").content as Quiz)
      .quizId
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
    }

    questionId = (
      adminQuizCreateQuestion(
        user,
        quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      ).content as { questionId: number }
    ).questionId
  })

  test("Question Id does not refer to a valid question within this quiz", () => {
    const result = adminQuizQuestionUpdate(
      user,
      quizId,
      questionId + 1,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers,
    )

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error:
          "Question Id does not refer to a valid question within this quiz",
      },
    })
  })
  test.each([
    { question: "Less" },
    { question: "Les" },
    { question: "Le" },
    { question: "L" },
    { question: "" },
    { question: "This is way longer than fifty characters please trust me" },
  ])(
    "Error: Question string is less than 5 characters in length or greater than 50 characters in length",
    ({ question }) => {
      questInfo.question = question

      const result = adminQuizQuestionUpdate(
        user,
        quizId,
        questionId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      )

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            "Question string is less than 5 characters in length or greater than 50 characters in length",
        },
      })
    },
  )

  test.each([
    {
      answers: [
        { answer: "Pikachu", correct: true },
        { answer: "Thomas", correct: false },
        { answer: "Charmander", correct: false },
        { answer: "Charizard", correct: false },
        { answer: "Raichu", correct: false },
        { answer: "Squirtle", correct: false },
        { answer: "Rattata", correct: false },
      ],
    },
    {
      answers: [{ answer: "Pikachu", correct: true }],
    },
  ])("Error: The question has more than 6 answers", ({ answers }) => {
    questInfo.answers = answers
    const result = adminQuizQuestionUpdate(
      user,
      quizId,
      questionId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers,
    )

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: "The question has more than 6 answers or less than 2 answers",
      },
    })
  })

  test.each([{ duration: 0 }, { duration: -1 }, { duration: -3 }])(
    "Error: The question duration is not a positive number",
    ({ duration }) => {
      questInfo.duration = duration

      const result = adminQuizQuestionUpdate(
        user,
        quizId,
        questionId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      )

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error: "The question duration is not a positive number",
        },
      })
    },
  )

  test.each([
    // Since we already have one question which has a duration of 4s when running beforeEach, we need to take that into account when considering the parameters for this test.

    // 4 + 10 * 9 + 100 = 194
    { initialDuration: 10, updatedDurationOnLastQuestion: 100, numQuestions: 10 },
    
    // 4 + 85 * 1 + 92 = 181 
    { initialDuration: 85, updatedDurationOnLastQuestion: 92, numQuestions: 2 },
    
    // 4 + 25 * 5 + 52 = 181
    { initialDuration: 25, updatedDurationOnLastQuestion: 52, numQuestions: 6 },
    
    // 4 + 30 * 4 + 70 = 194
    { initialDuration: 30, updatedDurationOnLastQuestion: 70, numQuestions: 5 },
    
    // 4 + 176 * 0 + 177 = 181
    { initialDuration: 176, updatedDurationOnLastQuestion: 177, numQuestions: 1 },
  ])(
    "Error: The sum of the question durations in the quiz exceeds 3 minutes",
    ({ initialDuration, updatedDurationOnLastQuestion, numQuestions }) => {
      questInfo.duration = initialDuration

      let lastQuestionId;

      for (let i = 0; i < numQuestions; ++i) {
        lastQuestionId = (adminQuizCreateQuestion(
          user,
          quizId,
          questInfo.question,
          questInfo.duration,
          questInfo.points,
          questInfo.answers,
        ).content as { questionId: number}).questionId
      }

      const result = adminQuizQuestionUpdate(
        user,
        quizId,
        lastQuestionId,
        questInfo.question,
        updatedDurationOnLastQuestion,
        questInfo.points,
        questInfo.answers,
      )

      // Each question has a duration of 60s, so three of them added up to 180s = 3 mins
      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            "The sum of the question durations in the quiz exceeds 3 minutes",
        },
      })
    },
  )

  test.each([{ points: 11 }, { points: 12 }, { points: 0 }, { points: -1 }])(
    "Error: The points awarded for the question are less than 1 or greater than 10",
    ({ points }) => {
      questInfo.points = points

      const result = adminQuizQuestionUpdate(
        user,
        quizId,
        questionId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      )

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            "The points awarded for the question are less than 1 or greater than 10",
        },
      })
    },
  )
  test.each([
    {
      answers: [
        { answer: "Pikachu", correct: false },
        { answer: "", correct: true },
        { answer: "Raichu", correct: false },
      ],
    },
    {
      answers: [
        { answer: "Pukachi", correct: false },
        { answer: "OMG", correct: false },
        { answer: "this is way longer than 30 characters long", correct: true },
      ],
    },
  ])(
    "Error: The length of any answer is shorter than 1 character long, or longer than 30 characters long",
    ({ answers }) => {
      questInfo.answers = answers

      const result = adminQuizQuestionUpdate(
        user,
        quizId,
        questionId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      )

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            "The length of any answer is shorter than 1 character long, or longer than 30 characters long",
        },
      })
    },
  )

  test.each([
    {
      answers: [
        { answer: "Pikachu", correct: false },
        { answer: "Pikachu", correct: true },
        { answer: "Pikachu", correct: false },
      ],
    },
    {
      answers: [
        { answer: "Thomas", correct: false },
        { answer: "Han", correct: false },
        { answer: "Thomas", correct: true },
      ],
    },
  ])(
    "Error: Any answer strings are duplicates of one another (within the same question)",
    ({ answers }) => {
      questInfo.answers = answers

      const result = adminQuizQuestionUpdate(
        user,
        quizId,
        questionId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      )

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            "Any answer strings are duplicates of one another (within the same question)",
        },
      })
    },
  )

  test.each([
    {
      answers: [
        { answer: "Pikachu", correct: false },
        { answer: "Pukachi", correct: false },
        { answer: "Chikapu", correct: false },
      ],
    },
    {
      answers: [
        { answer: "Thomas", correct: false },
        { answer: "Han", correct: false },
      ],
    },
  ])("Error: There are no correct answers", ({ answers }) => {
    questInfo.answers = answers

    const result = adminQuizQuestionUpdate(
      user,
      quizId,
      questionId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers,
    )

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: "There are no correct answers",
      },
    })
  })

  test.each([
    {
      invalidToken: {
        token: "-1",
      },
    },
    {
      invalidToken: {
        token: "",
      },
    },
  ])(
    "Error: Token is empty or invalid (does not refer to valid logged in user session)",
    ({ invalidToken }) => {
      const result = adminQuizQuestionUpdate(
        invalidToken,
        quizId,
        questionId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      )

      expect(result).toStrictEqual({
        statusCode: 401,
        content: {
          error:
            "Token is empty or invalid (does not refer to valid logged in user session)",
        },
      })
    },
  )

  test("Error: Valid token is provided, but user is not an owner of this quiz", () => {
    const user2 = adminAuthRegister(
      "thangthongthai@gmai.com",
      "2705uwuwuwu",
      "Thomas",
      "Hanh",
    ).content as ReturnedToken
    const result = adminQuizQuestionUpdate(
      user2,
      quizId,
      questionId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers,
    )

    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: "Valid token is provided, but user is not an owner of this quiz",
      },
    })
  })

  test("Success: Successfully update a question, only 1 question in the quiz", () => {
    const currTimeStamp = getCurrentTimestamp()

    const result = adminQuizQuestionUpdate(
      user,
      quizId,
      questionId,
      "This is a question",
      180,
      9,
      [
        { answer: "Pikachu", correct: true },
        { answer: "Thomas", correct: false },
        { answer: "Charmander", correct: false },
        { answer: "Charizard", correct: false },
      ],
    )

    expect(result).toStrictEqual({
      statusCode: 200,
      content: {},
    })

    const quizInfo = adminQuizInfo(user, quizId)
    expect(quizInfo).toStrictEqual({
      statusCode: 200,
      content: {
        quizId: quizId,
        name: "Quiz 1",
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: "Description",
        numQuestions: 1,
        duration: 180,
        questions: [
          {
            questionId: questionId,
            question: "This is a question",
            duration: 180,
            points: 9,
            answers: [
              {
                answer: "Pikachu",
                correct: true,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
              {
                answer: "Thomas",
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
              {
                answer: "Charmander",
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
              {
                answer: "Charizard",
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
            ],
          },
        ],
      },
    })

    const timeLastEdited = (quizInfo.content as QuizObject).timeLastEdited
    expect(timeLastEdited - currTimeStamp).toBeLessThanOrEqual(1)
  })

  test("Success: Successfully update a question, 2 questions in the quiz", () => {
    const currTimeStamp = getCurrentTimestamp()

    const questionId2 = (
      adminQuizCreateQuestion(
        user,
        quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
      ).content as { questionId: number }
    ).questionId

    const result = adminQuizQuestionUpdate(
      user,
      quizId,
      questionId2,
      "This is a question",
      170,
      9,
      [
        { answer: "Pikachu", correct: true },
        { answer: "Thomas", correct: false },
        { answer: "Charmander", correct: false },
        { answer: "Charizard", correct: false },
      ],
    )

    expect(result).toStrictEqual({
      statusCode: 200,
      content: {},
    })

    const quizInfo = adminQuizInfo(user, quizId)
    expect(quizInfo).toStrictEqual({
      statusCode: 200,
      content: {
        quizId: quizId,
        name: "Quiz 1",
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: "Description",
        numQuestions: 2,
        duration: 174,
        questions: [
          {
            questionId: questionId,
            question: "What is that pokemon",
            duration: 4,
            points: 5,
            answers: [
              {
                answer: "Pikachu",
                correct: true,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
              {
                answer: "Thomas",
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
            ],
          },
          {
            questionId: questionId2,
            question: "This is a question",
            duration: 170,
            points: 9,
            answers: [
              {
                answer: "Pikachu",
                correct: true,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
              {
                answer: "Thomas",
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
              {
                answer: "Charmander",
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
              {
                answer: "Charizard",
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number),
              },
            ],
          },
        ],
      },
    })

    const timeLastEdited = (quizInfo.content as QuizObject).timeLastEdited
    expect(timeLastEdited - currTimeStamp).toBeLessThanOrEqual(1)
  })
})
