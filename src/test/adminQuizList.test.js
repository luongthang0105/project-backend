import {adminQuizList} from "../quiz"
import {clear} from "../other"

beforeEach(() => {
  clear()
})

describe('adminQuizList', () => {
  test('ERROR: AuthUserId is not a valid user', () => {
    expect(adminQuizList(1)).toStrictEqual({
      error: "AuthUserId is not a valid user"
    })
  })

  test('SUCCESS: List of quizzes returned', () => {
    expect(adminQuizList(1)).toStrictEqual({
      quizzes: [
        {
          quizId: 1,
          name: Quiz1
        }
      ]
    })
  })
})