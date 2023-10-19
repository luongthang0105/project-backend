import { adminAuthRegister, adminAuthLogin } from "../auth"
import { clear } from "../other"
describe("adminAuthLogin", () => {
  beforeEach(() => {
    clear()
  })
  test("ERROR: Email address does not exist", () => {
    adminAuthRegister("javascript@gmail.com", "aikfnrg7", "Java", "Script")
    const error = adminAuthLogin("python@gmail.com", "aikfnrg7")
    expect(error).toEqual({ error: "Email adress does not exist" })
  })
  test("ERROR: Password is not correct for the given email", () => {
    adminAuthRegister("javascript@gmail.com", "aikfnrg7", "Java", "Script")
    const error = adminAuthLogin("javascript@gmail.com", "aikfnrg8")
    expect(error).toEqual({
      error: "Password is not correct for the given email",
    })
  })
  test("ERROR: Password is case-insensitive", () => {
    adminAuthRegister("javascript@gmail.com", "aikfnrg7", "Java", "Script")
    const error = adminAuthLogin("javascript@gmail.com", "Aikfnrg7")
    expect(error).toEqual({
      error: "Password is not correct for the given email",
    })
  })
  test("ERROR: No registeration done", () => {
    const error = adminAuthLogin("java@gmail.com", "gdnkgeg4")
    expect(error).toEqual({ error: "Email adress does not exist" })
  })
  test("Success: 1 person registered", () => {
    const userId1 = adminAuthRegister(
      "javascript@gmail.com",
      "aikfnrg7",
      "Java",
      "Script"
    )
    const success = adminAuthLogin("javascript@gmail.com", "aikfnrg7")
    expect(success).toEqual(userId1)
  })
  test("Success: More than 1 person registered", () => {
    adminAuthRegister("javascript@gmail.com", "aikfnrg7", "Java", "Script")
    const userId2 = adminAuthRegister(
      "java@gmail.com",
      "gdnkgeg4",
      "Hello",
      "World"
    )
    const success = adminAuthLogin("java@gmail.com", "gdnkgeg4")
    expect(success).toEqual(userId2)
  })
})
