import {
  adminQuizCreate,
  adminAuthRegister,
  clear,
  adminAuthLogout,
  adminQuizSessionStart,
  adminQuizCreateQuestion,
  adminQuizDeleteQuestion
} from '../testWrappersV1';
import { Question, Quiz, ReturnedToken } from '../types';

let user1: ReturnedToken;
let quiz1: Quiz;
let questInfo1: Question;
let question1: number;

beforeEach(() => {
  clear();
  user1 = adminAuthRegister(
    'sasaki@gmai.com',
    '2705uwuwuwuwuwuw',
    'Mutsuki',
    'Sasaki'
  ).content as ReturnedToken;
  quiz1 = adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz').content as Quiz;
  questInfo1 = {
    question: 'What is that pokemon',
    duration: 4,
    points: 5,
    answers: [
      {
        answer: 'Pikachu',
        correct: true,
      },
      {
        answer: 'Thomas',
        correct: false,
      },
    ],
    thumbnailUrl: 'http://google.com/some/image/path.jpg'
  };
  question1 = adminQuizCreateQuestion(
    user1,
    quiz1.quizId,
    questInfo1.question,
    questInfo1.duration,
    questInfo1.points,
    questInfo1.answers
  ).content.questionId;
});

describe('adminQuizSessionStart', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): Logged out session', () => {
    adminAuthLogout(user1);
    const result = adminQuizSessionStart(user1, quiz1.quizId, 3);
    expect(result).toStrictEqual({
      content: {
        error:
            'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });
  test('Token is empty or invalid (does not refer to valid logged in user session): Empty token', () => {
    const unavailableToken = {
      token: '',
    };
    const result = adminQuizSessionStart(unavailableToken, quiz1.quizId, 3);
    expect(result).toStrictEqual({
      content: {
        error:
            'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });
  test('autoStartNum is a number greater than 50', () => {
    const result = adminQuizSessionStart(user1, quiz1.quizId, 51);
    expect(result).toStrictEqual({
      content: {
        error:
            'autoStartNum is a number greater than 50',
      },
      statusCode: 400
      ,
    });
  });
  test('The quiz does not have any questions in it', () => {
    adminQuizDeleteQuestion(user1, quiz1.quizId, question1);
    const result = adminQuizSessionStart(user1, quiz1.quizId, 30);
    expect(result).toStrictEqual({
      content: {
        error:
            'The quiz does not have any questions in it',
      },
      statusCode: 400
      ,
    });
  });
  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = adminAuthRegister('muttsuki@gmail.com', '2705t3huwu', 'Type', 'Script').content as ReturnedToken;
    const result = adminQuizSessionStart(user2, quiz1.quizId, 30);
    expect(result).toStrictEqual({
      content: {
        error:
          'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403
      ,
    });
  });
  test('SUCCESS', () => {
    const result = adminQuizSessionStart(user1, quiz1.quizId, 30);
    expect(result).toStrictEqual({
      content: { sessionId: expect.any(Number) },
      statusCode: 200
      ,
    });
  });
});

test('A maximum of 10 sessions that are not in END state currently exist', () => {
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 3);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  adminQuizSessionStart(user1, quiz1.quizId, 2);
  const result = adminQuizSessionStart(user1, quiz1.quizId, 3);
  expect(result).toStrictEqual({
    content: {
      error:
          'A maximum of 10 sessions that are not in END state currently exist',
    },
    statusCode: 400
    ,
  });
});