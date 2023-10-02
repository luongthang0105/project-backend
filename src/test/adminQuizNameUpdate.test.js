import {adminQuizNameUpdate} from "../quiz"
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
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      error: 'Quiz ID does not refer to a valid quiz'
    })
  })

  test('ERROR: Quiz ID does not refer to a quiz that this user owns', () => {
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      error: 'Quiz ID does not refer to a quiz that this user owns'
    })
  })

  test('ERROR: Name contains invalid characters', () => {
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      error: 'Name contains invalid characters'
    })
  })

  test('ERROR: Name is less than 3 characters long', () => {
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      error: 'Name is less than 3 characters long'
    })
  })

  test('ERROR: Name is greater than 30 characters long', () => {
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      error: 'Name is greater than 30 characters long'
    })
  })

  test('ERROR: Name is already used for another quiz', () => {
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      error: 'Name is already used for another quiz'
    })
  })

  test('Success: Returns {} if no error', () => {
    expect(adminQuizNameUpdate(1, 1, 'name')).toStrictEqual({
      Success: {}
    })
  })

})
