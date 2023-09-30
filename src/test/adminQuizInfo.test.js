
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
