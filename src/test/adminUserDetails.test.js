import { adminAuthRegister, adminAuthLogin, adminUserDetails } from '../auth.js'
import { clear } from "../other.js"
describe ('adminUserDetails', () => {
  beforeEach(() => {
    clear()
  })
  test('ERROR: AuthUserId is not a valid user', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    const error = adminUserDetails(user1.authUserId + 1)
    expect(error).toEqual({error: 'AuthUserId is not a valid user'})
  })
  test('SUCCESS: Registeration', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}})
  })
  test('SUCCESS: Registeration => Successful Login', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0}})
  })
  test('SUCCESS: Registeration => Successful Login => Incorrect Password', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 1}})
  })
  test('SUCCESS: Registeration => Incorrect Password', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 1}})
  })
  test('SUCCESS: Registeration => Incorrect Password => Successful Login', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0}})
  })
  test('SUCCESS: Registeration => Incorrect Password => Successful Login => Incorrect Password', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 1}})
  })
  test('SUCCESS: Registeration => Successful Login => Successful Login', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg7')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 3, numFailedPasswordsSinceLastLogin: 0}})
  })
  test('SUCCESS: Registeration => Incorrect Password => Incorrect Password', () => {
    const user1 = adminAuthRegister('javascript@gmail.com', 'aikfnrg7', 'Java', 'Script')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8')
    adminAuthLogin('javascript@gmail.com', 'aikfnrg8')
    const success = adminUserDetails(user1.authUserId)
    expect(success).toStrictEqual({user: {userId: user1.authUserId, name: 'Java Script', email: 'javascript@gmail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 2}})
  })
})
