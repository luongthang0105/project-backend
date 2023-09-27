import { adminQuizCreate } from "../quiz"
import { adminAuthRegister } from "../auth"

beforeEach(() => {
    clear();
  });

describe("adminQuizCreate", () => {
    test('AuthUserId is not a valid user', () => {
        expect(adminQuizCreate(1, 'Hayden', 'This is my quiz')).toStrictEqual({
            error: expect.any(String),
        })
    })
    
    test('Name contains invalid characters: alphanumeric', () => {
        expect(adminQuizCreate(1, '1Han', 'This is my quiz').toStrictEqual({
            error: expect.any(String),
        }))
    })
    
    test('Name contains invalid characters: spaces', () => {
        expect(adminQuizCreate(1, 'H an', 'This is my quiz').toStrictEqual({
            error: expect.any(String)
        }))
    })
    
    test('Name is less than 3 characters long', () => {
        expect(adminQuizCreate(1, 'Hi', 'This is my quiz').toStrictEqual({
            error: expect.any(String)
        }))
    })
    
    test('Name is more than 30 characters long', () => {
        expect(adminQuizCreate(1, 'okiokiokiokiokiokiokiokiokiokioki', 'This is my quiz').toStrictEqual({
            error: expect.any(String)
        }))
    })
    
    test('Name is already used by the current logged in user for another quiz', () => {
        expect(adminQuizCreate(1, 'Han', 'This is my quiz').toStrictEqual({
            error: expect.any(String)
        }))
    })
    
    test('Description is more than 100 characters in length', () => {
        expect(adminQuizCreate(1, 'Han', 'Llllorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu').toStrictEqual({
            error: expect.any(String)
        }))
    })
    
    test('Success: return { quizId }', () => {
        const user = adminAuthRegister('han-mail', '2705', 'Han', 'Hanh');
        expect(adminQuizCreate(user.authUserId, 'Han', 'This is my quiz').toStrictEqual({
            quizId: expect.any(Number) 
        }))
    })
})


