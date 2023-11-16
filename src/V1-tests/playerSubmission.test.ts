import { adminQuizCreate, adminQuizCreateQuestion } from "../testWrappersV2"
import {
  adminAuthRegister,
  adminQuizGetSessionStatus,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  clear,
  playerJoinSession,
  playerStatus,
} from "../testWrappersV1"
import { Quiz, ReturnedToken } from "../types"

import "./toHaveValidRandomPlayerName"
import { expect, test } from "@jest/globals"
import { sleepSync } from "./sleepSync"

describe("playerJoinSession", () => {
  let user1: ReturnedToken
  let quiz1: Quiz
  let questInfo1
  let question1
  let session1: number
  const duration = 1

  beforeEach(() => {
    clear()
    user1 = adminAuthRegister(
      "sasaki@gmai.com",
      "2705uwuwuwuwuwuw",
      "Mutsuki",
      "Sasaki",
    ).content as ReturnedToken
    quiz1 = adminQuizCreate(user1, "Hihihihihih", "This is my quiz")
      .content as Quiz
    questInfo1 = {
      question: "What is that pokemon",
      duration: duration,
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
      thumbnailUrl: "http://google.com/some/image/path.jpg",
    }
    question1 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo1.question,
      questInfo1.duration,
      questInfo1.points,
      questInfo1.answers,
      questInfo1.thumbnailUrl,
    ).content.questionId

    question1 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo1.question,
      questInfo1.duration,
      questInfo1.points,
      questInfo1.answers,
      questInfo1.thumbnailUrl,
    ).content.questionId
    expect(question1).toStrictEqual(expect.any(Number))
    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId
  })

  test("Error: Player ID does not exist", () => {
    const status = playerSubmission([0], -1, 1)

    expect(status).toStrictEqual({
      content: {
        error: "Player ID does not exist",
      },
      statusCode: 400,
    })
  })

  test.each([
    // For LOBBY state only (and END and FINAL_RES)
    { questionPos: 0 },
    // Out of bounds
    { questionPos: 3 },
  ])(
    "Error: Question position is not valid for the session this player is in",
    (questionPos) => {
      const player1 = playerJoinSession(session1, "Thomas").content.playerId
      expect(player1).toStrictEqual(expect.any(Number))

      const status = playerSubmission([0], player1, questionPos)
      expect(status).toStrictEqual({
        content: {
          error:
            "Question position is not valid for the session this player is in",
        },
        statusCode: 400,
      })
    },
  )

  test("Error: Session is not in QUESTION_OPEN state, At LOBBY", () => {
    const player1 = playerJoinSession(session1, "Thomas").content.playerId
    expect(player1).toStrictEqual(expect.any(Number))

    const status = playerSubmission([0], player1, 1)

    expect(status).toStrictEqual({
      content: {
        error: "Session is not in QUESTION_OPEN state",
      },
      statusCode: 400,
    })
  })

  test("Error: Session is not in QUESTION_OPEN state, At QUESTION_COUNTDOWN", () => {
    const player1 = playerJoinSession(session1, "Thomas").content.playerId
    expect(player1).toStrictEqual(expect.any(Number))

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "NEXT_QUESTION",
    )
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    })

    let status = playerStatus(player1)
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe("QUESTION_COUNTDOWN");
    
    status = playerSubmission([0], player1, 1)
    expect(status).toStrictEqual({
      content: {
        error: "Session is not in QUESTION_OPEN state",
      },
      statusCode: 400,
    })
  })

  test("Error: If session is not yet up to this question", () => {
    const player1 = playerJoinSession(session1, "Thomas").content.playerId
    expect(player1).toStrictEqual(expect.any(Number))

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "NEXT_QUESTION",
    )
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    })
    
    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "SKIP_COUNTDOWN",
    )
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    })

    let status = playerStatus(player1)
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe("QUESTION_OPEN");
    
    // Currently at question 1, now submit to question 2
    status = playerSubmission([0], player1, 2)
    expect(status).toStrictEqual({
      content: {
        error: "If session is not yet up to this question",
      },
      statusCode: 400,
    })
  })
  
  test.each([
    // Neg id mix with valid ids
    { answerId: [-1, 0, 1] },
    // Neg id only
    { answerId: [-1] },
    // Out of bound id mix with valid id
    { answerId: [2, 0] },
    // Out of bound id only
    { answerId: [2] },
    // Out of bound id and neg id
    { answerId: [2, -1] },
    // Out of bound id and neg id mix with valid id
    { answerId: [2, -1, 3, 0] },
  ])("Error: Answer IDs are not valid for this particular question", (answerId) => {
    const player1 = playerJoinSession(session1, "Thomas").content.playerId
    expect(player1).toStrictEqual(expect.any(Number))

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "NEXT_QUESTION",
    )
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    })
    
    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "SKIP_COUNTDOWN",
    )
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    })

    let status = playerStatus(player1)
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe("QUESTION_OPEN");
    
    // Valid answer ids are 0 or 1
    status = playerSubmission(answerId, player1, 1)
    expect(status).toStrictEqual({
      content: {
        error: "Answer IDs are not valid for this particular question",
      },
      statusCode: 400,
    })
  })

  test.each([
    { answerId: [0, 1, 1, 0] },
    { answerId: [0, 1, 1] },
    { answerId: [0, 1, 0] },
  ])("Error: There are duplicate answer IDs provided", (answerId) => {
    const player1 = playerJoinSession(session1, "Thomas").content.playerId
    expect(player1).toStrictEqual(expect.any(Number))

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "NEXT_QUESTION",
    )
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    })
    
    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "SKIP_COUNTDOWN",
    )
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    })

    let status = playerStatus(player1)
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe("QUESTION_OPEN");
    
    // Valid answer ids are 0 or 1
    status = playerSubmission(answerId, player1, 1)
    expect(status).toStrictEqual({
      content: {
        error: "There are duplicate answer IDs provided",
      },
      statusCode: 400,
    })
  })

  test("Error: Less than 1 answer ID was submitted", () => {
    const player1 = playerJoinSession(session1, "Thomas").content.playerId
    expect(player1).toStrictEqual(expect.any(Number))

    const nextQ = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "NEXT_QUESTION",
    )
    expect(nextQ).toStrictEqual({
      content: {},
      statusCode: 200,
    })
    
    const toOpenState = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      session1,
      "SKIP_COUNTDOWN",
    )
    expect(toOpenState).toStrictEqual({
      content: {},
      statusCode: 200,
    })

    let status = playerStatus(player1)
    expect(status.statusCode).toBe(200);
    expect(status.content.state).toBe("QUESTION_OPEN");
    
    // Empty answer ids
    status = playerSubmission([], player1, 1)
    expect(status).toStrictEqual({
      content: {
        error: "Less than 1 answer ID was submitted",
      },
      statusCode: 400,
    })
  })
})
