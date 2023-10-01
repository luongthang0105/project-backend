
import {adminQuizInfo, adminQuizList, adminQuizCreate} from "../quiz.js"
import {clear} from "../other"
import { adminAuthRegister } from "../auth"

describe ('adminQuizInfo', () =>  {
  test ('AuthUserID is not valid', () => {
    const result = adminQuizInfo('invalidUserId%', 1)
    expect(result).toStrictEqual({
      error: 'AuthUserID is not a valid user',
    })
      })
  test ('QuizID is not owned by this user', () => {
    const result2 = adminQuizInfo('userId', 999)
    expect(result2).toStrictEqual({
      error: 'Quiz ID does not refer to a quiz that this user owns',
        });
      })
  test ('QuizId is invalid', () => {
    const result3 = adminQuizInfo('userID', 'invalidQuizID')
    expect(result3).toStrictEqual({
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
      })
    })
})


