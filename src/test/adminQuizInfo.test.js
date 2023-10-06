import { adminQuizInfo, adminQuizCreate } from "../quiz.js"
import { clear } from "../other.js"
import { adminAuthRegister } from "../auth.js"

describe("adminQuizInfo", () => {
  let user, quiz
  beforeEach(() => {
    clear()
    user = adminAuthRegister("han@gmai.com", "2705uwuwuwu", "Han", "Hanh")
    quiz = adminQuizCreate(user.authUserId, "New Quiz", "description")
  })

  test("AuthUserID is not valid", () => {
    let result = adminQuizInfo(user.authUserId + 1, quiz.quizId)
    expect(result).toStrictEqual({
      error: "AuthUserID is not a valid user",
    })
  })

  test("Quiz ID does not refer to a valid quiz", () => {
    const result = adminQuizInfo(user.authUserId, quiz.quizId + 1)
    expect(result).toStrictEqual({
      error: "Quiz ID does not refer to a valid quiz",
    })
  })

  test("Quiz ID does not refer to a quiz that this user owns", () => {
    let user2 = adminAuthRegister(
      "thang@gmail.com",
      "0105uwuwuw",
      "Thomas",
      "Nguyen"
    )
    let quiz2 = adminQuizCreate(
      user2.authUserId,
      "New Quiz 2",
      "long description"
    )

    const result = adminQuizInfo(user.authUserId, quiz2.quizId)

    expect(result).toStrictEqual({
      error: "Quiz ID does not refer to a quiz that this user owns",
    })
  })

  test("Success: Quiz Information Retrieved:", () => {
    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual({
      quizId: quiz.quizId,
      name: expect.any(String),
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: expect.any(String),
    })
  })

  test("Success: More Quiz Retrieved:", () => {
    let user2 = adminAuthRegister(
      "thang@gmail.com",
      "0105uwuwuw",
      "Thomas",
      "Nguyen"
    )
    let quiz2 = adminQuizCreate(
      user2.authUserId,
      "New Quiz 2",
      "long description"
    )

    expect(adminQuizInfo(user2.authUserId, quiz2.quizId)).toStrictEqual({
      quizId: quiz2.quizId,
      name: expect.any(String),
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: expect.any(String),
    })
  })
})
