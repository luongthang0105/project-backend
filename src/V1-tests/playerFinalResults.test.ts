import {
  adminAuthRegister,
  clear,
  adminAuthLogout,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  adminQuizSessionResults,
  playerJoinSession,
  adminQuizInfo,
  playerSubmission,
  playerFinalResults,
} from "../testWrappersV1"
import { adminQuizCreate, adminQuizCreateQuestion } from "../testWrappersV2"
import { Question, Quiz, ReturnedToken } from "../types"
import { sleepSync } from "./sleepSync"

let user1: ReturnedToken
let quiz1: Quiz
let questInfo1: Question
let questInfo2: Question
let question1: number
let question2: number
let quizSession1: number
const duration = 4

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
    thumbnailUrl:
      "https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg",
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
  questInfo2 = {
    question: "Are penguins birds?",
    duration: duration,
    thumbnailUrl: "https://as2./97/penguinQ.jpg",
    points: 4,
    answers: [
      {
        answer: "Yes",
        correct: true,
      },
      {
        answer: "No",
        correct: false,
      },
    ],
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
  question2 = adminQuizCreateQuestion(
    user1,
    quiz1.quizId,
    questInfo2.question,
    questInfo2.duration,
    questInfo2.points,
    questInfo2.answers,
    questInfo2.thumbnailUrl,
  ).content.questionId
  quizSession1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId
})

describe("playerFinalResults", () => {
  test("Player ID does not exist", () => {
    const result = playerFinalResults(-1);
    expect(result).toStrictEqual({
      content: {
        error:
          "Player ID does not exist",
      },
      statusCode: 400,
    })
  })

  test("Session is not in FINAL_RESULTS state", () => {
    const player1 = playerJoinSession(quizSession1, "Mutsuki").content.playerId
    const result = playerFinalResults(player1);
    
    expect(result).toStrictEqual({
      content: {
        error:
          "Session is not in FINAL_RESULTS state",
      },
      statusCode: 400,
    })
  })
  
  test("Success:", () => {
    const player1 = playerJoinSession(quizSession1, "Mutsuki").content.playerId
    const player2 = playerJoinSession(quizSession1, "Thomas").content.playerId
    const player3 = playerJoinSession(quizSession1, "Han").content.playerId
    const answerId1 = adminQuizInfo(user1, quiz1.quizId).content.questions[0]
      .answers[0].answerId as number
    const answerId2 = adminQuizInfo(user1, quiz1.quizId).content.questions[1]
      .answers[0].answerId as number
    const answerId3 = adminQuizInfo(user1, quiz1.quizId).content.questions[1]
      .answers[1].answerId as number
    const answer1 = [answerId1]
    const answer2 = [answerId2]
    const answer3 = [answerId3]

    let status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      quizSession1,
      "SKIP_COUNTDOWN",
    )
    expect(status.statusCode).toBe(200)

    sleepSync(2)
    // Answer in 2 secs
    playerSubmission(answer1, player1, 1)
    
    sleepSync(1)
    // Answer in 3 secs 
    playerSubmission(answer1, player2, 1)
    playerSubmission(answer1, player3, 1)
    // --> total: 8 secs
    sleepSync(1)

    status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      quizSession1,
      "NEXT_QUESTION",
    )
    expect(status.statusCode).toBe(200)
    status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      quizSession1,
      "SKIP_COUNTDOWN",
    )
    expect(status.statusCode).toBe(200)

    // Answered in 0 seconds - correct, 4 pts
    playerSubmission(answer2, player1, 2)
    
    // Answered in 1 seconds - wrong, 0 pts 
    sleepSync(1)
    playerSubmission(answer3, player2, 2)
    // Answered in 1 seconds - correct, 4/2 = 2 pts
    playerSubmission(answer2, player3, 2)
    
    // 3s until end
    sleepSync(3)

    status = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      quizSession1,
      "GO_TO_FINAL_RESULTS",
    )
    expect(status.statusCode).toBe(200)

    const result1 = playerFinalResults(player1).content
    const result2 = playerFinalResults(player2).content
    const result3 = playerFinalResults(player3).content

    const expectedObject = {
      usersRankedByScore: [
        {
          name: "Mutsuki",
          // 5/1 + 4/1
          score: 9,
        },
        {
          name: "Han",
          // 5/3 + 4/2
          score: 3.7,
        },
        {
          name: "Thomas",
          // 5/2 + 0
          score: 2.5,
        },
      ],
      questionResults: [
        {
          questionId: question1,
          playersCorrectList: ["Mutsuki", "Thomas", "Han"],
          // (2 + 3 + 3) / 3
          averageAnswerTime: 3,
          percentCorrect: 100,
        },
        {
          questionId: question2,
          playersCorrectList: ["Mutsuki", "Han"],
          averageAnswerTime: 1,
          percentCorrect: 67,
        },
      ],
    }

    expect(result1).toStrictEqual(expectedObject)
    expect(result2).toStrictEqual(expectedObject)
    expect(result3).toStrictEqual(expectedObject)
  })
})
