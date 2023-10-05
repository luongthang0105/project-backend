import { adminQuizCreate, adminQuizRemove, adminQuizInfo } from "../quiz.js"
import { adminAuthRegister } from "../auth.js"
import { clear } from "../other"

beforeEach(() => {
    clear()
})
describe("adminQuizRemove", () => {

    test('AuthUserId is not a valid user: dataStore is empty', () => {
        let result = adminQuizRemove(1, 1)
        expect(result).toStrictEqual({
            error: "AuthUserId is not a valid user"
        })
    })

    test('AuthUserId is not a valid user: dataStore has 1 user', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        let result = adminQuizRemove(user.authUserId + 1, 1);
        expect(result).toStrictEqual({
            error: "AuthUserId is not a valid user"
        })
    })

    test('AuthUserId is not a valid user: dataStore has 2 users', () => {
        const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const user02 = adminAuthRegister('hanh@gmai.com', '27705uwuwuwuwuwuw', 'Hanh', 'Han')
        let result = adminQuizRemove(user02.authUserId + 1, 1)
        expect(result).toStrictEqual({
            error: "AuthUserId is not a valid user"
        })
    })

    test('Quiz ID does not refer to a valid quiz: dataStore has 0 quiz', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        let result = adminQuizRemove(user.authUserId, 1)
        expect(result).toStrictEqual({
            error: "Quiz ID does not refer to a valid quiz"
        })
    })

    test('Quiz ID does not refer to a valid quiz: dataStore has 1 quiz', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const quiz = adminQuizCreate(user.authUserId, 'Hi', 'This is my quiz')
        let result = adminQuizRemove(user.authUserId, quiz.quizId + 1)
        expect(result).toStrictEqual({
            error: "Quiz ID does not refer to a valid quiz"
        })
    })

    test('Quiz ID does not refer to a quiz that this user owns', () => {
        const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const user02 = adminAuthRegister('hanh@gmai.com', '2705uuwuwuwuwuwuw', 'Hanh', 'Han')
        const quiz01 = adminQuizCreate(user01.authUserId, 'Hihihihihih', 'This is my quiz')
        const quiz02 = adminQuizCreate(user02.authUserId, 'Hiiii', 'This is my quiz')
        expect(adminQuizRemove(user01.authUserId, quiz02.quizId)).toStrictEqual({
            error: "Quiz ID does not refer to a quiz that this user owns"
        })
    })

    test('Successful case: delete 1 quiz from a user who has 2 quizzes', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const quiz01 = adminQuizCreate(user.authUserId, 'Hihihihihih', 'This is my quiz')
        const quiz02 = adminQuizCreate(user.authUserId, 'Hiiii', 'This is my quiz')
        expect(adminQuizRemove(user.authUserId, quiz02.quizId)).toStrictEqual({ })
        const result = adminQuizInfo(user.authUserId, quiz02.quizId)
        expect(result).toStrictEqual({
            error: "Quiz ID does not refer to a valid quiz"
        })
    })
})