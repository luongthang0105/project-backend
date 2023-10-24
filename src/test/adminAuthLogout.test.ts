import { adminAuthRegister, adminAuthLogin } from "../testWrappers"
import { clear } from "../other"

describe ('adminAuthLogout', () => {
  let user 
  beforeEach(() => {
    clear()
      user = adminAuthRegister('nuha381@gmail,com','Fjeyvwr43', 'Enn', 'Cee').content
  })
  it ('should successfully logout', () => {
    const token = user.token
    const result = adminAuthLogout(token)
    expect(result).toStrictEqual({})
    })
  it ('returns error when token is empty or invalid', () => {
    const invalidToken = ''
    const result = adminAuthLogout(invalidToken)
    expect(result.statusCode).toBe(401)
    expect(result.error).toEqual("error");
  })
})