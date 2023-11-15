import {
  adminAuthRegister,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  clear,
} from '../testWrappersV1';
import {
  adminQuizRemove,
  adminQuizCreate,
  adminQuizInfo,
  adminQuizCreateQuestion,
} from '../testWrappersV2';
import { Quiz, ReturnedToken } from '../types';

beforeEach(() => {
  clear();
});

const questInfo = {
  question: 'What is that pokemon',
  duration: 1,
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
  thumbnailUrl:
    'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
};

describe('adminQuizRemove', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore is empty', () => {
    const unavailableToken = {
      token: '0',
    };
    const result = adminQuizRemove(unavailableToken, 1);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session): dataStore has 1 user', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const invalidToken = {
      token: '-1',
    };
    const quiz = adminQuizCreate(user, 'Quiz01', 'myQuiz').content as Quiz;
    const result = adminQuizRemove(invalidToken, quiz.quizId);
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Quiz ID does not refer to a valid quiz: dataStore has 0 quiz', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const result = adminQuizRemove(user, 1);
    expect(result).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Quiz ID does not refer to a valid quiz: dataStore has 1 quiz', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz = adminQuizCreate(user, 'Hii', 'This is my quiz').content as Quiz;
    const result = adminQuizRemove(user, quiz.quizId + 1);
    expect(result).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const user01 = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const user02 = adminAuthRegister(
      'hanh@gmai.com',
      '2705uuwuwuwuwuwuw',
      'Hanh',
      'Han'
    ).content as ReturnedToken;
    const quiz01 = adminQuizCreate(user01, 'Hihihihihih', 'This is my quiz')
      .content as Quiz;
    const quiz02 = adminQuizCreate(user02, 'Hiiii', 'This is my quiz')
      .content as Quiz;
    expect(adminQuizRemove(user01, quiz02.quizId)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
    expect(adminQuizRemove(user02, quiz01.quizId)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Error: All sessions for this quiz must be in END state', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz = adminQuizCreate(user, 'Hii', 'This is my quiz').content as Quiz;
    // console.log(quiz);
    expect(
      adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
        questInfo.thumbnailUrl
      ).statusCode
    ).toBe(200);

    const session1 = adminQuizSessionStart(user, quiz.quizId, 3).content
      .sessionId;
    expect(session1).toStrictEqual(expect.any(Number));

    const result = adminQuizRemove(user, quiz.quizId);
    expect(result).toStrictEqual({
      content: { error: 'All sessions for this quiz must be in END state' },
      statusCode: 400,
    });
  });

  test('Success: All sessions are in END state', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    const quiz = adminQuizCreate(user, 'Hii', 'This is my quiz').content as Quiz;
    expect(
      adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
        questInfo.thumbnailUrl
      ).statusCode
    ).toBe(200);

    const session1 = adminQuizSessionStart(user, quiz.quizId, 3).content
      .sessionId;
    expect(session1).toStrictEqual(expect.any(Number));

    const toEndState = adminQuizSessionStateUpdate(
      user,
      quiz.quizId,
      session1,
      'END'
    );
    expect(toEndState.statusCode).toStrictEqual(200);

    const result = adminQuizRemove(user, quiz.quizId);
    expect(result).toStrictEqual({
      content: {},
      statusCode: 200,
    });
  });

  test('Successful case: delete 1 quiz from a user who has 2 quizzes', () => {
    const user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwuwuwuw',
      'Han',
      'Hanh'
    ).content as ReturnedToken;

    adminQuizCreate(user, 'Hihihihihih', 'This is my quiz');

    const quiz02 = adminQuizCreate(user, 'Hiiii', 'This is my quiz')
      .content as Quiz;

    const quizRemoved = adminQuizRemove(user, quiz02.quizId);
    expect(quizRemoved).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const result = adminQuizInfo(user, quiz02.quizId);
    expect(result).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });
});
