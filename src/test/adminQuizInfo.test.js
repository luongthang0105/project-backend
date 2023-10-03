<<<<<<< HEAD

import {adminQuizInfo, adminQuizList, adminQuizCreate} from "../quiz.js"
import {clear} from "../other"
import { adminAuthRegister } from "../auth"

describe ('adminQuizInfo', () =>  {
  test ('AuthUserID is not valid', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
    const result = adminQuizInfo(1, 1)
=======
import {adminQuizInfo, adminQuizList, adminQuizCreate} from "../quiz"
import {clear} from "../other"
import { adminAuthRegister } from "../auth"
describe ('adminQuizInfo', () =>  {
  let user, quiz
  beforeEach(() => {
    clear()
    user = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
    quiz = adminQuizCreate(user.authUserId, 'New Quiz', 'description')
  })

  test ('AuthUserID is not valid', () => {
    let result = adminQuizInfo(user.authUserId + 1, quiz.quizId)
>>>>>>> 2f18bc1ec3111bcccce134dccf205d3ef7a9f221
    expect(result).toStrictEqual({
      error: 'AuthUserID is not a valid user',
    })
  })

<<<<<<< HEAD
  test('User already exists', () => {
    const user01 = adminAuthRegister('nuha@ou.com', '2705uwuwuwu', 'Ennc', 'Nuha')
    const user02 = adminAuthRegister('nuha@ou.com', '2705uwuwuwu', 'Ennc', 'Nuha')
    const result = adminQuizInfo(1, 1)
    expect(result).toStrictEqual ({
      error: 'AuthUserID is not a valid user'
    })
  })

  test('New Quiz', () => {
    const user03 = adminAuthRegister('nuha@ou.com', '2705uwuwuwu', 'Ennc', 'Nuha')
    const AuthUserID = user03.authUserID
    const quizName = 'ThisIsTheName'
    const description = 'This is the description for Quiz 1'
    const result02 = adminQuizCreate(authUserID, quizName, description)
    expect(quizCreationResult).toStrictEqual(1);
    expect(result).toBeGreaterThan(0)
    expect(result).toHaveProperty('name', quizName);
    expect(result).toHaveProperty('description', description);
  })
  test ('QuizID is not owned by this user', () => {
    const result03 = adminQuizInfo(1, 999)
    expect(result03).toStrictEqual({
      error: 'Quiz ID does not refer to a quiz that this user owns',
    })
  })
  test ('QuizId is invalid', () => {
    const result04 = adminQuizInfo(1, -1)
    expect(resul04).toStrictEqual({
      error: "QuizID is invalid"
    })
  })
  test ('Success: Quiz Information Retrieved:', () => {
    expect(adminQuizInfo(1)).toStrictEqual({
      {
        quizId: 1,
        name: 'MyQuiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz'
=======
  test('Quiz ID does not refer to a valid quiz', () => {
    const result = adminQuizInfo(user.authUserId, quiz.quizId + 1)
    expect(result).toStrictEqual ({
      error: 'Quiz ID does not refer to a valid quiz'
    })
  })

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    let user2 = adminAuthRegister('thang@gmail.com', '0105uwuwuw', 'Thomas', 'Nguyen')
    let quiz2 = adminQuizCreate(user2.authUserId, 'New Quiz 2', 'long description')

    const result = adminQuizInfo(user.authUserId, quiz2.quizId)

    expect(result).toStrictEqual ({
      error: 'Quiz ID does not refer to a quiz that this user owns'
    })
  })

  test ('Success: Quiz Information Retrieved:', () => {
    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual(
      {
        quizId: quiz.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String)
      })
    })

  test ('Success: More Quiz Retrieved:', () => {
    let user2 = adminAuthRegister('thang@gmail.com', '0105uwuwuw', 'Thomas', 'Nguyen')
    let quiz2 = adminQuizCreate(user2.authUserId, 'New Quiz 2', 'long description')

    expect(adminQuizInfo(user2.authUserId, quiz2.quizId)).toStrictEqual(
      {
        quizId: quiz2.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String)
>>>>>>> 2f18bc1ec3111bcccce134dccf205d3ef7a9f221
      })
    })
})


