import { adminAuthRegister, adminAuthLogin } from "../testWrappers"
import { clear } from "../other"
let user = adminAuthRegister('nuha381@gmail,com','Fjeyvwr43', 'Enn', 'Cee').content

describe ('adminAuthLogout', () => {
  it ('should successfully logout', () => {
    const token = user.token
    const result = adminAuthLogout(token)
    expect(clear).toHaveBeenCalled()
    expect(result.statusCode).toBe(200)
    })
  it ('returns error when token is empty or invalid', () => {
    const invalidToken = ''
    const result = adminAuthLogout(invalidToken)
    expect(result.statusCode).toBe(401)
    expect(result.content).toEqual({ error: "error" });
  })
})