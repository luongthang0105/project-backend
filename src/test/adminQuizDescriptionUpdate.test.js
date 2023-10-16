import {
  adminQuizInfo,
  adminQuizCreate,
  adminQuizDescriptionUpdate,
} from "../quiz.ts"
import { adminAuthRegister } from "../auth.js"
import { clear } from "../other.js"
describe("adminQuizDescriptionUpdate", () => {
  let user, quiz
  beforeEach(() => {
    clear()
    user = adminAuthRegister("han@gmai.com", "2705uwuwuwu", "Han", "Hanh")
    quiz = adminQuizCreate(user.authUserId, "New Quiz", "description")
  })

  test("AuthUserId is not a valid user", () => {
    const result = adminQuizDescriptionUpdate(
      user.authUserId + 1,
      quiz.quizId,
      "New description"
    )
    expect(result).toStrictEqual({
      error: "AuthUserID is not a valid user",
    })
  })

  test("Quiz ID does not refer to a valid quiz", () => {
    const result3 = adminQuizDescriptionUpdate(
      user.authUserId,
      quiz.quizId + 1,
      "Description"
    )
    expect(result3).toStrictEqual({
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

    const result2 = adminQuizDescriptionUpdate(
      user.authUserId,
      quiz2.quizId,
      "Description"
    )
    expect(result2).toStrictEqual({
      error: "Quiz ID does not refer to a quiz that this user owns",
    })
  })

  test("Description is more than 100 characters in length", () => {
    const oldDescription = adminQuizInfo(
      user.authUserId,
      quiz.quizId
    ).description
    // 105 characters
    const newDescription =
      "okidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidoki."

    const result = adminQuizDescriptionUpdate(
      user.authUserId,
      quiz.quizId,
      newDescription
    )
    expect(result).toEqual({
      error: "Description is more than 100 characters in length",
    })

    let quizInfo = adminQuizInfo(user.authUserId, quiz.quizId)
    expect(quizInfo.description).toStrictEqual(oldDescription)
  })
  test("Success case: check different timestamps", () => {
    expect(
      adminQuizDescriptionUpdate(
        user.authUserId,
        quiz.quizId,
        "New description"
      )
    ).toStrictEqual({})

    let quizInfo = adminQuizInfo(user.authUserId, quiz.quizId)
    expect(quizInfo.description).toStrictEqual("New description")
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(quizInfo.timeLastEdited)
  })
  test("Success case: Empty Description", () => {
    expect(
      adminQuizDescriptionUpdate(
        user.authUserId,
        quiz.quizId,
        ""
      )
    ).toStrictEqual({})

    let quizInfo = adminQuizInfo(user.authUserId, quiz.quizId)
    expect(quizInfo.description).toStrictEqual("")
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(quizInfo.timeLastEdited)
  })
  
})
