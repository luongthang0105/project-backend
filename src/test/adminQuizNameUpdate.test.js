import {
  adminQuizCreate,
  adminQuizNameUpdate,
  adminQuizInfo,
  adminAuthRegister,
  clear
} from "../testWrappers"

describe("adminQuizNameUpdate", () => {
  beforeEach(() => {
    clear()
  })
  const invalidToken = {
    token: "-1"
  }

  test("ERROR: AuthUserId is not a valid user", () => {
    expect(adminQuizNameUpdate(invalidToken, -1, "name")).toStrictEqual({
      content: {error: "Token is empty or invalid (does not refer to valid logged in user session)"},
      statusCode: 401
    })
  })

  test("ERROR: Quiz ID does not refer to a valid quiz", () => {
    const user = adminAuthRegister(
      "han@gmai.com",
      "2705uwuwuwuwuwuw",
      "Han",
      "Hanh"
    ).content
    expect(adminQuizNameUpdate(user, -1, "name")).toStrictEqual({
      content: {error: "Quiz ID does not refer to a valid quiz"},
      statusCode: 400
    })
  })

  test("ERROR: Valid token is provided, but user is not an owner of this quiz", () => {
    const user01 = adminAuthRegister(
      "han@gmai.com",
      "2705uwuwuwuwuwuw",
      "Han",
      "Hanh"
    ).content
    const user02 = adminAuthRegister(
      "hanh@gmai.com",
      "270555uwuwuwuwuwuw",
      "Hanh",
      "Haanh"
    ).content
    const quiz01 = adminQuizCreate(
      user01.authUserId,
      "quiz",
      "This is my quiz"
    ).content
    expect(
      adminQuizNameUpdate(user02, quiz01.quizId, "name")
    ).toStrictEqual({
      content: {error: "Valid token is provided, but user is not an owner of this quiz"},
      statusCode: 403
    })
  })

  test.each([
    { name: "name-" },
    { name: "-----" },
    { name: "name123-" },
    { name: "name 123 -" },
    { name: "123-" },
    { name: "   -   -" },
  ])("ERROR: Name contains invalid characters", ({ name }) => {
    const user01 = adminAuthRegister(
      "han@gmai.com",
      "2705uwuwuwuwuwuw",
      "Han",
      "Hanh"
    ).content
    const quiz01 = adminQuizCreate(
      user01.authUserId,
      "quiz",
      "This is my quiz"
    ).content
    expect(
      adminQuizNameUpdate(user01, quiz01.quizId, name)
    ).toStrictEqual({
      content: {error: "Name contains invalid characters"},
      statusCode: 400
    })
  })

  test("ERROR: Name is less than 3 characters long", () => {
    const user01 = adminAuthRegister(
      "han@gmai.com",
      "2705uwuwuwuwuwuw",
      "Han",
      "Hanh"
    ).content
    const quiz01 = adminQuizCreate(
      user01.authUserId,
      "quiz",
      "This is my quiz"
    ).content
    expect(
      adminQuizNameUpdate(user01, quiz01.quizId, "na")
    ).toStrictEqual({
      content: {error: "Name is less than 3 characters long"},
      statusCode: 400
    })
  })

  test("ERROR: Name is greater than 30 characters long", () => {
    const user01 = adminAuthRegister(
      "han@gmai.com",
      "2705uwuwuwuwuwuw",
      "Han",
      "Hanh"
    ).content
    const quiz01 = adminQuizCreate(
      user01.authUserId,
      "quiz",
      "This is my quiz"
    ).content
    expect(
      adminQuizNameUpdate(
        user01.authUserId,
        quiz01.quizId,
        "uwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuwuw"
      )
    ).toStrictEqual({
      content: {error: "Name is greater than 30 characters long"},
      statusCode: 400
    })
  })

  test("ERROR: Name is already used for another quiz", () => {
    const user01 = adminAuthRegister(
      "han@gmai.com",
      "2705uwuwuwuwuwuw",
      "Han",
      "Hanh"
    ).content
    const quiz01 = adminQuizCreate(
      user01.authUserId,
      "quiz01",
      "This is my quiz"
    ).content
    const quiz02 = adminQuizCreate(
      user01.authUserId,
      "quiz02",
      "This is my quiz"
    ).content
    expect(
      adminQuizNameUpdate(user01, quiz01.quizId, "quiz02")
    ).toStrictEqual({
      error:
        "Name is already used by the current logged in user for another quiz",
      statusCode: 400
    })
  })

  test('Success: Returns {} if no error, 1 user', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh').content
    const quiz01 = adminQuizCreate(user01, 'quiz01', 'This is my quiz').content

    expect(adminQuizNameUpdate(user01, quiz01.quizId, 'name').content).toStrictEqual({})

    const quizInfo = adminQuizInfo(user01, quiz01.quizId).content
    expect(quizInfo.name).toStrictEqual("name")
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(
      quizInfo.timeCreated
    )
  })

  test('Success: Returns {} if no error, 2 different users', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh').content
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz01', 'This is my quiz').content
    
    const user02 = adminAuthRegister('han222@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh').content
    const quiz02 = adminQuizCreate(user02.authUserId, 'quiz02', 'This is my quiz 2').content

    expect(adminQuizNameUpdate(user02, quiz02.quizId, 'name').content).toStrictEqual({})

    const quizInfo = adminQuizInfo(user02, quiz02.quizId).content
    expect(quizInfo.name).toStrictEqual("name")
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizInfo.timeCreated)
  })

  test('Success: Returns {} if no error, updating same name', () => {
    const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh').content
    const quiz01 = adminQuizCreate(user01.authUserId, 'quiz01', 'This is my quiz').content    
    expect(
      adminQuizNameUpdate(user01.authUserId, quiz01.quizId, "quiz01").content
    ).toStrictEqual({})
    const quizInfo = adminQuizInfo(user01, quiz01.quizId).content
    expect(quizInfo.name).toStrictEqual("quiz01")
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(
      quizInfo.timeCreated
    )
  })
})
