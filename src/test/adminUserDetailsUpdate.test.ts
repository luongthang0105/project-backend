import {   
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails } from "../testWrappers"
import validator from "validator";
import { ReturnedToken } from '../types';
import { clear } from "../other"

describe('adminUserDetailsUpdate', () => {
  let user: ReturnedToken;
  beforeEach(() => {
    clear();
    user = adminAuthRegister (
      '23748',
      'javascript@gmail.com',
      'Java',
      'Script'
    ).content as ReturnedToken;
    user2 = adminAuthRegister (
      '25181',
      'javascript1@yahoo.com',
      'Jay',
      'Ess'
    ).content as ReturnedToken
  })
  test ('should successfully update user details', () => {
    const email = 'newjavascript@gmail.com'
    const nameFirst = 'NewJava'
    const nameLast = 'NewScript'
    const token = user.token
    const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast)
    expect(result).toStrictEqual({})
  })
  test ('The email is already used by another user', () => {
    const email2 = 'javascript1@yahoo.com'
    const nameFirst = 'NewJava'
    const nameLast = 'NewScript'
    const token = user.token
    const result = adminUserDetailsUpdate(token, email2, nameFirst, nameLast)
    expect(result.statusCode).toBe(400);
    expect(result.content).toEqual("error")
  })
  test ('The email is invalid', () => {
    const email = 'javascript@'
    const nameFirst = 'NewJava'
    const nameLast = 'NewScript'
    const token = user.token
    const isEmailValid = validator.isEmail(email);
    expect(isEmailValid).toBe(false);
    const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
    expect(result.statusCode).toBe(400)
    expect(result.content).toEqual("error")

  })
  test ('First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophe', () => {
    const email = 'newjavascript@gmail.com'
    const nameFirst = 'Jav@'
    const nameLast = 'Script'
    const token = user.token
    const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast)
    
    expect(result.statusCode).toBe(400);
    expect(result.content).toEqual("error")
  })
  test ('First name is less than 2 characters or more than 20 characters', () => {
    const email = 'newjavascript@gmail.com'
    const nameFirstTooShort = 'J' 
    const nameFirstTooLong = 'Javahefuehfehfaklwnfsjehf'
    const nameLast = 'Script'
    const token = user.token

    let result = adminUserDetailsUpdate(token, email, nameFirstTooShort, nameLast);
    expect(result.statusCode).toBe(400);
    expect(result.content).toEqual("error")

    let result2 = adminUserDetailsUpdate(token, email, nameFirstLong, nameLast);
    expect(result.statusCode).toBe(400);
    expect(result.content).toEqual("error")
  })
  test ('Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophe', () => {
    const email = 'newjavascript@gmail.com'
    const nameFirst = 'Java'
    const nameLast = 'Scrip%2'
    const token = user.token
    const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast)
    
    expect(result.statusCode).toBe(400);
    expect(result.content).toEqual("error")
  })
  test ('Last name is less than 2 characters or more than 20 characters', () => {
    const email = 'newjavascript@gmail.com'
    const nameFirst = 'Java'
    const nameLastTooShort = 'S'
    const nameLastTooLong = 'Scekfhjoeuwheowthweoufthqd'
    const token = user.token

    let result = adminUserDetailsUpdate(token, email, nameLastTooShort, nameLast);
    expect(result.statusCode).toBe(400);
    expect(result.content).toEqual("error")

    let result2 = adminUserDetailsUpdate(token, email, nameLastTooLong, nameLast);
    expect(result.statusCode).toBe(400);
    expect(result.content).toEqual("error")
  })
  test ('token is invalid or empty', () => {
    const invalidToken = ''
    const result = adminUserDetailsUpdate(invalidToken)
    expect(result.statusCode).toBe(401)
    expect(result.error).toEqual("error");
  })
})
