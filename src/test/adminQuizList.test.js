import {adminQuizList, adminQuizCreate,adminQuizRemove} from "../quiz"
import {adminAuthRegister} from "../auth"
import {clear} from "../other"

beforeEach(() => {
  clear()
})

describe('adminQuizList', () => {
  test('ERROR: AuthUserId is not a valid user', () => {
    const user1  = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    expect(adminQuizList(user1 + 1)).toEqual({
      error: "AuthUserId is not a valid user"
    })
  })
  test('SUCCESS: Empty List', () => {
    const user1  = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    expect(adminQuizList(user1)).toStrictEqual({
      quizzes: [
      ]
    })
  })
  test('SUCCESS: 1 element', () => {
    const user1  = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    const quiz1 = adminQuizCreate(user1,'Quiz_1', 'good quiz')
    const success = adminQuizList(quiz1)
    expect(success).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz_1'
        }
      ]
    })
  })
  test('SUCCESS: 2 elements', () => {
    const user1  = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    const quiz1 = adminQuizCreate(user1,'Quiz_1', 'good quiz')
    const quiz2 = adminQuizCreate(user1, 'Quiz_2', '')
    const success = adminQuizList(quiz1)
    expect(success).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz_1'
        },
        {
          quizId: quiz2,
          name: 'Quiz_2'
        }
      ]
    })
  })
  test('SUCCESS: 2 quizzes for user1 and 1 quiz for user2 ', () => {
    const user1 = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    const user2 = adminAuthRegister('mutsuki@gmail.com', 'adfweweee7', 'Java', 'Script')
    const quiz1 = adminQuizCreate(user1,'Quiz_1', 'good quiz')
    const quiz2 = adminQuizCreate(user2, 'Quiz 2', 'little quiz')
    const quiz3 = adminQuizCreate(user1, 'Quiz_3', '')
    const success1 = adminQuizList(user1)
    const success2 = adminQuizList(user2)
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz_1'
        },
        {
          quizId: quiz3,
          name: 'Quiz_3'
        }
      ]
    })
    expect(success2).toStrictEqual({
      quizzes: [
        {
          quizId: quiz2,
          name: 'Quiz 2'
        }
      ]
    })
  })
  test('SUCCESS: Quiz list after deleting the 1st element of 3 elements list', () => {
    const user1 = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    const quiz1 = adminQuizCreate(user1,'Quiz_1', 'good quiz')
    const quiz2 = adminQuizCreate(user1, 'Quiz 2', 'little quiz')
    const quiz3 = adminQuizCreate(user1, 'Quiz_3', '')
    adminQuizRemove(user1, quiz1)
    const success1 = adminQuizList(user1)
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz2,
          name: 'Quiz_2'
        },
        {
          quizId: quiz3,
          name: 'Quiz_3'
        }
      ]
    })
  })
  test('SUCCESS: Quiz list after deleting the 2nd element of 3 elements list', () => {
    const user1 = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    const quiz1 = adminQuizCreate(user1,'Quiz_1', 'good quiz')
    const quiz2 = adminQuizCreate(user1, 'Quiz 2', 'little quiz')
    const quiz3 = adminQuizCreate(user1, 'Quiz_3', '')
    adminQuizRemove(user1, quiz2)
    const success1 = adminQuizList(user1)
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz_1'
        },
        {
          quizId: quiz3,
          name: 'Quiz_3'
        }
      ]
    })
  })
  test('SUCCESS: Quiz list after deleting the 3rd element of 3 elements list', () => {
    const user1 = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    const quiz1 = adminQuizCreate(user1,'Quiz_1', 'good quiz')
    const quiz2 = adminQuizCreate(user1, 'Quiz 2', 'little quiz')
    const quiz3 = adminQuizCreate(user1, 'Quiz_3', '')
    adminQuizRemove(user1, quiz3)
    const success1 = adminQuizList(user1)
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz_1'
        },
        {
          quizId: quiz2,
          name: 'Quiz_2'
        }
      ]
    })
  })
  test('SUCCESS: Empty quiz list after deleting all the elements of 3 elements list', () => {
    const user1 = adminAuthRegister('sasaki@gmail.com', 'hdngied3,', 'Mutsuki', 'Sasaki')
    const quiz1 = adminQuizCreate(user1,'Quiz_1', 'good quiz')
    const quiz2 = adminQuizCreate(user1, 'Quiz 2', 'little quiz')
    const quiz3 = adminQuizCreate(user1, 'Quiz_3', '')
    adminQuizRemove(user1, quiz1)
    adminQuizRemove(user1, quiz2)
    adminQuizRemove(user1, quiz3)
    const success1 = adminQuizList(user1)
    expect(success1).toStrictEqual({
      quizzes: [
      ]
    })
  })
})