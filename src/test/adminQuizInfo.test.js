<<<<<<< HEAD
<<<<<<< HEAD

import {adminQuizInfo, adminQuizList, adminQuizCreate} from "../quiz.js"
import {clear} from "../other"
import { adminAuthRegister } from "../auth"

describe ('adminQuizInfo', () =>  {
  test ('AuthUserID is not valid', () => {
    expect(adminQuizInfo(1)).toStrictEqual({
        error: "AuthUserID is an invalid user"
      })
  })
  test ('QuizID is not owned by this user', () => {
    expect(adminQuizInfo(1)).toStrictEqual ({
        error: "QuizID is not owned by this user"
      })
    })
  test ('QuizId is invalid', () => {
    expect(adminQuizCreate(1)).toStrictEqual({
        error: "QuizID is invalid"
      })
  })
  test ('Success: Quiz Information Retrieved:', () => {
    expect(adminQuizInfo(1)).toStrictEqual(
      {
        quizId: 1,
        name: 'MyQuiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz'
      })
    })
})
=======
import {adminQuizInfo, adminQuizList, adminQuizCreate} from "../quiz"
import {clear} from "../other"
import { adminAuthRegister } from "../auth"
describe ('adminQuizInfo', () =>  {
=======
import { adminQuizInfo, adminQuizCreate } from "../quiz.js"
import { clear } from "../other.js"
import { adminAuthRegister } from "../auth.js"

describe("adminQuizInfo", () => {
>>>>>>> 1bc89fed3093c499728d705361d88a390d15e8c1
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
      name: "New Quiz",
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: "description",
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
      name: "New Quiz 2",
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: "long description",
    })
  })
})
<<<<<<< HEAD


>>>>>>> 2f18bc1ec3111bcccce134dccf205d3ef7a9f221
=======
>>>>>>> 1bc89fed3093c499728d705361d88a390d15e8c1
