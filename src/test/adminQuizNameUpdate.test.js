import { adminQuizCreate, adminQuizNameUpdate, adminQuizInfo } from "../quiz"
import { adminAuthRegister } from "../auth"
import {clear} from "../other"

beforeEach(() => {
  clear()
})

describe('adminQuizNameUpdate', () => {
  test('ERROR: AuthUserId is not a valid user', () => {
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      error: 'AuthUserId is not a valid user'
    })
  })

  test('ERROR: Quiz ID does not refer to a valid quiz', () => {
    const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
    expect(adminQuizNameUpdate(user.authUserId, 1, 'name')).toStrictEqual({
      error: 'Quiz ID does not refer to a valid quiz'
    })
  })

  test('ERROR: Quiz ID does not refer to a quiz that this user owns', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
    const user02 = adminAuthRegister('hanh@gmai.com', '270555uwuwuwuwuwuw', 'Hanh', 'Haanh')
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz', 'This is my quiz')
    expect(adminQuizNameUpdate(user02.authUserId, quiz01.quizId, 'name')).toStrictEqual({
      error: 'Quiz ID does not refer to a quiz that this user owns'
    })
  })

  test('ERROR: Name contains invalid characters', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz', 'This is my quiz')
    expect(adminQuizNameUpdate(user01.authUserId, quiz01.quizId, 'name-')).toStrictEqual({
      error: 'Name contains invalid characters'
    })
  })

  test('ERROR: Name is less than 3 characters long', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz', 'This is my quiz')
    expect(adminQuizNameUpdate(user01.authUserId, quiz01.quizId, 'na')).toStrictEqual({
      error: 'Name is less than 3 characters long'
    })
  })

  test('ERROR: Name is greater than 30 characters long', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz', 'This is my quiz')
    expect(adminQuizNameUpdate(user01.authUserId, quiz01.quizId, 'uwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuw')).toStrictEqual({
      error: 'Name is greater than 30 characters long'
    })
  })

  test('ERROR: Name is already used for another quiz', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz01', 'This is my quiz')
    const quiz02 = adminQuizCreate(user01.authUserId, 'quiz02', 'This is my quiz')
    expect(adminQuizNameUpdate(user01.authUserId, quiz01.quizId, 'quiz02')).toStrictEqual({
      error: 'Name is already used by the current logged in user for another quiz'
    })
  })

  test('Success: Returns {} if no error', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz01', 'This is my quiz')
    expect(adminQuizNameUpdate(user01.authUserId, quiz01.quizId, 'name')).toStrictEqual({})
    const quizInfo = adminQuizInfo(user01.authUserId, quiz01.quizId)
    expect(quizInfo.name).toStrictEqual("name")
  })

})
