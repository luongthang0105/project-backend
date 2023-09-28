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

    test('AuthUserId is not a valid user: dataStore not empty', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(1, 'Hayden', 'This is my quiz')).toStrictEqual({
            error: "AuthUserId is not a valid user",
        })
    })

    test('Name contains invalid characters: alphanumeric', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, '1Han', 'This is my quiz')).toStrictEqual({
            error: "Name contains invalid characters: alphanumeric",
        })
    })
    
    test('Name contains invalid characters: spaces', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, 'H an', 'This is my quiz')).toStrictEqual({
            error: "Name contains invalid characters: spaces"
        })
    })
    
    test('Name is less than 3 characters long', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(0, 'Hi', 'This is my quiz')).toStrictEqual({
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
    
    test('Success: return { quizId }', () => {
        const user = adminAuthRegister('han@gmai.com', '2705uwuwuwuwuwuw', 'Han', 'Hanh')
        expect(adminQuizCreate(user.authUserId, 'Han', 'This is my quiz')).toStrictEqual({
            quizId: 0
        })
    })
})


