import {adminQuizInfo, adminQuizList, adminQuizCreate, adminQuizDescriptionUpdate} from "../quiz.js"
import { adminAuthRegister } from "../auth"
import {clear} from "../other"

describe('adminQuizDescriptionUpdate', () => {
  test ('AuthUserID is not valid', () => {
    const result = adminQuizDescriptionUpdate('invalidUserId%', 1, 'Description')
    expect(result).toStrictEqual({
      error: 'AuthUserID is not a valid user',
    })
  })
  test ('QuizID is not owned by this user', () => {
    const result2 = adminQuizDescriptionUpdate('userId', 999, 'Description')
    expect(result2).toStrictEqual({
      error: 'Quiz ID does not refer to a quiz that this user owns',
    })
  })
  test ('QuizId is invalid', () => {
    const result3 = adminQuizDescriptionUpdate('userID', 'invalidQuizID', 'Description')
    expect(result3).toStrictEqual({
      error: "QuizID is invalid"
    })
  })
  test ('Description is more than 100 characters', () => {
    const authUserId = 'ThisismyPass34@'
    const quizID = 999;
    const descriptionCharacters = 'The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the very lazy dog.'
    const result = adminQuizDescriptionUpdate(authUserId, quizId, descriptionCharacters)
    expect(result).toEqual({
      error: 'Description exceed the 100 characters limit'
    })
  })
  test ('Success case', () => {
    expect(adminQuizDescriptionUpdate(1)).toStrictEqual({
    })
  })
})
