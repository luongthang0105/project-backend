import { clear } from "../other.js"
import {
  adminAuthLogin,
  adminAuthRegister,
  adminUserDetails,
} from "../auth.js"
import {
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizRemove,
} from "../quiz.js"

describe("Test on all admin functions", () => {
  beforeEach(() => {
    clear()
  })

  test("Success", () => {
    let user01 = adminAuthRegister(
      "ltngu05@gmail.com",
      "ltngu2705",
      "Thang",
      "Ngu"
    )
    let user02 = adminAuthRegister(
      "ltngu06@gmail.com",
      "ltngu2705",
      "Thang",
      "Ko Ngu"
    )
    let user03 = adminAuthRegister(
      "ltngu07@gmail.com",
      "ltngu2705",
      "Han",
      "Hanh"
    )

    // user01 log in okay
    expect(adminAuthLogin("ltngu05@gmail.com", "ltngu2705")).toStrictEqual({
      authUserId: user01.authUserId,
    })

    // user01 failed 1 time
    expect(adminAuthLogin("ltngu05@gmail.com", "ltngu27056")).toStrictEqual({
      error: expect.any(String),
    })
    expect(
      adminUserDetails(user01.authUserId).user.numSuccessfulLogins
    ).toStrictEqual(2)
    expect(
      adminUserDetails(user01.authUserId).user.numFailedPasswordsSinceLastLogin
    ).toStrictEqual(1)

    // user01 now log in successful
    expect(
      adminAuthLogin("ltngu05@gmail.com", "ltngu2705").authUserId
    ).toStrictEqual(user01.authUserId)
    expect(
      adminUserDetails(user01.authUserId).user.numSuccessfulLogins
    ).toStrictEqual(3)
    expect(
      adminUserDetails(user01.authUserId).user.numFailedPasswordsSinceLastLogin
    ).toStrictEqual(0)

    let quiz01 = adminQuizCreate(user01.authUserId, "Quiz 01", "Des 1")
    let quiz02 = adminQuizCreate(user02.authUserId, "Quiz 02", "Des 2")
    let quiz03 = adminQuizCreate(user03.authUserId, "Quiz 03", "Des 3")

    let quiz04 = adminQuizCreate(user01.authUserId, "Quiz 04", "Des 4")
    let quiz05 = adminQuizCreate(user02.authUserId, "Quiz 05", "Des 5")
    let quiz06 = adminQuizCreate(user03.authUserId, "Quiz 06", "Des 6")

    let quizList1 = adminQuizList(user01.authUserId)
    expect(quizList1.quizzes.length).toStrictEqual(2)
    expect(quizList1.quizzes).toStrictEqual([
      {
        quizId: quiz01.quizId,
        name: "Quiz 01",
      },
      {
        quizId: quiz04.quizId,
        name: "Quiz 04",
      },
    ])
    let quizList2 = adminQuizList(user02.authUserId)
    expect(quizList2.quizzes.length).toStrictEqual(2)
    expect(quizList2.quizzes).toStrictEqual([
      {
        quizId: quiz02.quizId,
        name: "Quiz 02",
      },
      {
        quizId: quiz05.quizId,
        name: "Quiz 05",
      },
    ])

    let quizList3 = adminQuizList(user03.authUserId)
    expect(quizList3.quizzes.length).toStrictEqual(2)
    expect(quizList3.quizzes).toStrictEqual([
      {
        quizId: quiz03.quizId,
        name: "Quiz 03",
      },
      {
        quizId: quiz06.quizId,
        name: "Quiz 06",
      },
    ])

    expect(adminQuizRemove(user01.authUserId, quiz04.quizId)).toStrictEqual({})
    expect(adminQuizRemove(user01.authUserId, quiz01.quizId)).toStrictEqual({})

    expect(adminQuizRemove(user02.authUserId, quiz02.quizId)).toStrictEqual({})
    expect(adminQuizRemove(user03.authUserId, quiz06.quizId)).toStrictEqual({})

    quizList1 = adminQuizList(user01.authUserId)
    expect(quizList1.quizzes.length).toStrictEqual(0)
    expect(quizList1.quizzes).toStrictEqual([])

    quizList2 = adminQuizList(user02.authUserId)
    expect(quizList2.quizzes.length).toStrictEqual(1)
    expect(quizList2.quizzes).toStrictEqual([
      {
        quizId: quiz05.quizId,
        name: "Quiz 05",
      },
    ])

    quizList3 = adminQuizList(user03.authUserId)
    expect(quizList3.quizzes.length).toStrictEqual(1)
    expect(quizList3.quizzes).toStrictEqual([
      {
        quizId: quiz03.quizId,
        name: "Quiz 03",
      },
    ])

    // Change quiz05 name to quiz03
    expect(
      adminQuizNameUpdate(user02.authUserId, quiz05.quizId, "Quiz 03")
    ).toStrictEqual({})
    // Change quiz03 name to quiz05
    expect(
      adminQuizNameUpdate(user03.authUserId, quiz03.quizId, "Quiz 05")
    ).toStrictEqual({})

    expect(adminQuizInfo(user02.authUserId, quiz05.quizId).name).toStrictEqual(
      "Quiz 03"
    )
    expect(adminQuizInfo(user03.authUserId, quiz03.quizId).name).toStrictEqual(
      "Quiz 05"
    )

    // Change quiz05 des to Des 555
    expect(
      adminQuizDescriptionUpdate(user02.authUserId, quiz05.quizId, "Des 555")
    ).toStrictEqual({})
    // Change quiz05 des to Des 333
    expect(
      adminQuizDescriptionUpdate(user03.authUserId, quiz03.quizId, "Des 333")
    ).toStrictEqual({})

    expect(
      adminQuizInfo(user02.authUserId, quiz05.quizId).description
    ).toStrictEqual("Des 555")
    expect(
      adminQuizInfo(user03.authUserId, quiz03.quizId).description
    ).toStrictEqual("Des 333")
  })
})
