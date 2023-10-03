import {adminQuizInfo, adminQuizList, adminQuizCreate, adminQuizDescriptionUpdate} from "../quiz.js"
import { adminAuthRegister } from "../auth"
import {clear} from "../other"
describe('adminQuizDescriptionUpdate', () => {
	let user, quiz
	beforeEach(() => {
		clear()
		user = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
    quiz = adminQuizCreate(user.authUserId, 'New Quiz', 'description')	
	})

  test ('AuthUserID is not valid', () => {
    const result = adminQuizDescriptionUpdate(user.authUserId + 1, quiz.quizId, 'New description')
    expect(result).toStrictEqual({
      error: 'AuthUserID is not a valid user',
    })
  })
  test ('QuizID is not owned by this user', () => {
    const result2 = adminQuizDescriptionUpdate(1, 999, 'Description')
    expect(result2).toStrictEqual({
      error: 'Quiz ID does not refer to a quiz that this user owns',
    })
  })
  test ('QuizId is invalid', () => {
    const result3 = adminQuizDescriptionUpdate(1, -1, 'Description')
    expect(result3).toStrictEqual({
      error: "QuizID is invalid"
    })
  })
  test ('Description is more than 100 characters', () => {
    const authUserId = 1
    const quizID = 999;
    const descriptionCharacters = 'The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the very lazy dog.'
    const result = adminQuizDescriptionUpdate(authUserId, quizId, descriptionCharacters)
    expect(result).toEqual({
      error: 'Description exceed the 100 characters limit'
    })
  })
  test ('Success case', () => {
    let newUserId = adminAuthRegister('nuha@gmail.com', 'nuha@c$1', 'Nuha', 'Ennec')
    let newquizID = adminQuizCreate(newUserId, 'Nuha', 'Description')
    expect(adminQuizDescriptionUpdate(1, 1, 'description')).toStrictEqual({})
    expect(adminQuizInfo(1, 1).description).toStrictEqual('New des')

    expect(adminQuizDescriptionUpdate(1)).toStrictEqual({
    })
  })
})
