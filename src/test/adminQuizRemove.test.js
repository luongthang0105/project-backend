import { adminQuizCreate, adminQuizRemove } from "../quiz"
import { adminAuthRegister } from "../auth"
import { clear } from "../other"

beforeEach(() => {
    clear()
})

describe("adminQuizRemove", () => {
    test('AuthUserId is not a valid user: dataStore is empty', () => {
        expect(adminQuizRemove(1, 1)).toStrictEqual({
            error: "AuthUserId is not a valid user"
        })
    })

    test('AuthUserId is not a valid user: dataStore has 1 user', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizRemove(1, 1)).toStrictEqual({
            error: "AuthUserId is not a valid user"
        })
    })

    test('AuthUserId is not a valid user: dataStore has 2 users', () => {
        const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const user02 = adminAuthRegister('hanh@gmai.com', '27705uwuwuwuwuwuw', 'Hanh', 'Han')
        expect(adminQuizRemove(2, 1)).toStrictEqual({
            error: "AuthUserId is not a valid user"
        })
    })

    test('Quiz ID does not refer to a valid quiz: dataStore has 0 quiz', () => {
        expect(adminQuizRemove(0, 1)).toStrictEqual({
            error: "Quiz ID does not refer to a valid quiz"
        })
    })

    test('Quiz ID does not refer to a valid quiz: dataStore has 1 quiz', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const quiz = adminQuizCreate(0, 'Hi', 'This is my quiz')
        expect(adminQuizRemove(0, 1)).toStrictEqual({
            error: "Quiz ID does not refer to a valid quiz"
        })
    })

    test('Quiz ID does not refer to a quiz that this user owns', () => {
        const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const user02 = adminAuthRegister('hanh@gmai.com', '2705uuwuwuwuwuwuw', 'Hanh', 'Han')
        const quiz01 = adminQuizCreate(0, 'Hihihihihih', 'This is my quiz')
        const quiz02 = adminQuizCreate(1, 'Hiiii', 'This is my quiz')
        expect(adminQuizRemove(0, 1)).toStrictEqual({
            error: "Quiz ID does not refer to a quiz that this user owns"
        })
    })

    


})