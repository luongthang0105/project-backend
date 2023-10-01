import { adminQuizCreate } from "../quiz"
import { adminAuthRegister } from "../auth"
import { clear } from "../other"

beforeEach(() => {
    clear()
})

describe("adminQuizCreate", () => {
    test('AuthUserId is not a valid user: dataStore is empty', () => {
        expect(adminQuizCreate(1, 'Hayden', 'This is my quiz')).toStrictEqual({
            error: "AuthUserId is not a valid user",
        })
    })

    test('AuthUserId is not a valid user: dataStore has 1 user', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(1, 'Hayden', 'This is my quiz')).toStrictEqual({
            error: "AuthUserId is not a valid user",
        })
    })

    test('AuthUserId is not a valid user: dataStore has 2 users', () => {
        const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const user02 = adminAuthRegister('hanh@gmai.com', '2705uwuwuwuwuwuwuu', 'Hanh', 'Han')
        expect(adminQuizCreate(2, 'Hayden', 'This is my quiz')).toStrictEqual({
            error: "AuthUserId is not a valid user",
        })
    })

    test('Name contains invalid characters: mixed with letters and special character', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, 'Han Hanh!', 'This is my quiz')).toStrictEqual({
            error: "Name contains invalid characters",
        })
    })
    
    test('Name contains invalid characters: only special characters', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, '----', 'This is my quiz')).toStrictEqual({
            error: "Name contains invalid characters"
        })
    })
    
    test('Name contains invalid characters: mixed with numbers and special characters', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, '1234+', 'This is my quiz')).toStrictEqual({
            error: "Name contains invalid characters"
        })
    })

    test('Name is less than 3 characters long: with only letters', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, 'Hi', 'This is my quiz')).toStrictEqual({
            error: "Name is less than 3 characters long"
        })
    })

    test('Name is less than 3 characters long: with only number', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, '1', 'This is my quiz')).toStrictEqual({
            error: "Name is less than 3 characters long"
        })
    })

    test('Name is less than 3 characters long: mixed with number and letter', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, '1H', 'This is my quiz')).toStrictEqual({
            error: "Name is less than 3 characters long"
        })
    })

    test('Name is less than 3 characters long: empty string', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, '', 'This is my quiz')).toStrictEqual({
            error: "Name is less than 3 characters long"
        })
    })

    test('Name is more than 30 characters long', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, 'okiokiokiokiokiokiokiokiokiokioki', 'This is my quiz')).toStrictEqual({
            error: "Name is more than 30 characters long"
        })
    })
    
    test('Name is already used by the current logged in user for another quiz', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        adminQuizCreate(0, 'quiz', 'This is my quiz')
        expect(adminQuizCreate(0, 'quiz', 'This is my quiz')).toStrictEqual({
            error: "Name is already used by the current logged in user for another quiz"
        })
    })
    
    test('Description is more than 100 characters in length', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, 'Han', 'Llllorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu')).toStrictEqual({
            error: "Description is more than 100 characters in length"
        })
    })
    
    test('Success: case01: name contains only letters', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(user.authUserId, 'Han', 'This is my quiz')).toStrictEqual({
            quizId: 0
        })
    })

    test('Success: case02: name is mixed with letters and numbers', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(user.authUserId, 'Han123', 'This is my quiz')).toStrictEqual({
            quizId: 0
        })
    })

    test('Success: case03: name is mixed with letters, numbers and spaces', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(user.authUserId, 'Han 34 uwu', 'This is my quiz')).toStrictEqual({
            quizId: 0
        })
    })

    test('Success: case04: description is an empty string', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(user.authUserId, 'Han', '')).toStrictEqual({
            quizId: 0
        })
    })

    test('Success: case05: one user with 2 quizzes', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        adminQuizCreate(user.authUserId, 'Huhu', '')
        expect(adminQuizCreate(user.authUserId, 'Han', '')).toStrictEqual({
            quizId: 1
        })
    })

    test('Success: case06: 2 users, with one 1 quiz for each', () => {
        const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const user02 = adminAuthRegister('hanh@gmai.com', '2705uwuwuwuwuwuwu', 'Hanh', 'Han')
        adminQuizCreate(user01.authUserId, 'Huhu', '')
        expect(adminQuizCreate(user02.authUserId, 'Han', '')).toStrictEqual({
            quizId: 1
        })
    })

    test('Success: case07: 2 users, 1 quiz for each (with the same name, same description)', () => {
        const user01 = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        const user02 = adminAuthRegister('hanh@gmai.com', '2705uwuwuwuwuwuwu', 'Hanh', 'Han')
        adminQuizCreate(user01.authUserId, 'Han', '')
        expect(adminQuizCreate(user02.authUserId, 'Han', '')).toStrictEqual({
            quizId: 1
        })
    })
})


