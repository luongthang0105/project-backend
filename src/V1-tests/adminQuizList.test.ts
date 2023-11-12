import { adminQuizList, adminQuizCreate, adminQuizRemove } from '../testWrappersV1';
import { adminAuthRegister, clear } from '../testWrappersV1';
import { Quiz, QuizList, ReturnedToken } from '../types';

describe('adminQuizList', () => {
  let user1: ReturnedToken;

  beforeEach(() => {
    clear();
    user1 = adminAuthRegister(
      'sasaki@gmail.com',
      'hdngied3',
      'Mutsuki',
      'Sasaki'
    ).content as ReturnedToken;
  });

  const invalidToken = {
    token: '-1'
  };

  test('ERROR: Token is empty or invalid (does not refer to valid logged in user session)', () => {
    expect(adminQuizList(invalidToken)).toEqual({
      statusCode: 401,
      content: { error: 'Token is empty or invalid (does not refer to valid logged in user session)' },
    });
  });
  test('SUCCESS: Empty List', () => {
    expect(adminQuizList(user1).content as QuizList).toStrictEqual({
      quizzes: [],
    });
  });
  test('SUCCESS: 1 element', () => {
    const quiz1 = (adminQuizCreate(user1, 'Quiz1', 'good quiz').content as Quiz).quizId;
    const success = adminQuizList(user1).content as QuizList;
    expect(success).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz1',
        },
      ],
    });
  });
  test('SUCCESS: 2 elements', () => {
    const quiz1 = (adminQuizCreate(user1, 'Quiz1', 'good quiz').content as Quiz).quizId;
    const quiz2 = (adminQuizCreate(user1, 'Quiz2', '').content as Quiz).quizId;
    const success = adminQuizList(user1).content as QuizList;
    expect(success).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz1',
        },
        {
          quizId: quiz2,
          name: 'Quiz2',
        },
      ],
    });
  });
  test('SUCCESS: 2 quizzes for user1 and 1 quiz for user2 ', () => {
    const user2 = adminAuthRegister(
      'mutsuki@gmail.com',
      'adfweweee7',
      'Java',
      'Script'
    ).content as ReturnedToken;
    const quiz1 = (adminQuizCreate(user1, 'Quiz1', 'good quiz').content as Quiz).quizId;
    const quiz2 = (adminQuizCreate(user2, 'Quiz2', 'little quiz').content as Quiz).quizId;
    const quiz3 = (adminQuizCreate(user1, 'Quiz3', '').content as Quiz).quizId;
    const success1 = adminQuizList(user1).content as QuizList;
    const success2 = adminQuizList(user2).content as QuizList;
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz1',
        },
        {
          quizId: quiz3,
          name: 'Quiz3',
        },
      ],
    });
    expect(success2).toStrictEqual({
      quizzes: [
        {
          quizId: quiz2,
          name: 'Quiz2',
        },
      ],
    });
  });

  test('SUCCESS: Quiz list after deleting the 1st element of 3 elements list', () => {
    const quiz1 = (adminQuizCreate(user1, 'Quiz1', 'good quiz').content as Quiz).quizId;
    const quiz2 = (adminQuizCreate(user1, 'Quiz2', 'little quiz').content as Quiz).quizId;
    const quiz3 = (adminQuizCreate(user1, 'Quiz3', '').content as Quiz).quizId;
    adminQuizRemove(user1, quiz1);
    const success1 = adminQuizList(user1).content as QuizList;
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz2,
          name: 'Quiz2',
        },
        {
          quizId: quiz3,
          name: 'Quiz3',
        },
      ],
    });
  });
  test('SUCCESS: Quiz list after deleting the 2nd element of 3 elements list', () => {
    const quiz1 = (adminQuizCreate(user1, 'Quiz1', 'good quiz').content as Quiz).quizId;
    const quiz2 = (adminQuizCreate(user1, 'Quiz2', 'little quiz').content as Quiz).quizId;
    const quiz3 = (adminQuizCreate(user1, 'Quiz3', '').content as Quiz).quizId;
    adminQuizRemove(user1, quiz2);
    const success1 = adminQuizList(user1).content as QuizList;
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz1',
        },
        {
          quizId: quiz3,
          name: 'Quiz3',
        },
      ],
    });
  });
  test('SUCCESS: Quiz list after deleting the 3rd element of 3 elements list', () => {
    const quiz1 = (adminQuizCreate(user1, 'Quiz1', 'good quiz').content as Quiz).quizId;
    const quiz2 = (adminQuizCreate(user1, 'Quiz2', 'little quiz').content as Quiz).quizId;
    const quiz3 = (adminQuizCreate(user1, 'Quiz3', '').content as Quiz).quizId;

    const quizRemove = adminQuizRemove(user1, quiz3);
    expect(quizRemove.statusCode).toStrictEqual(200);

    const success1 = adminQuizList(user1).content as QuizList;
    expect(success1).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1,
          name: 'Quiz1',
        },
        {
          quizId: quiz2,
          name: 'Quiz2',
        },
      ],
    });
  });
  test('SUCCESS: Empty quiz list after deleting all the elements of 3 elements list', () => {
    const quiz1 = (adminQuizCreate(user1, 'Quiz1', 'good quiz').content as Quiz).quizId;
    const quiz2 = (adminQuizCreate(user1, 'Quiz2', 'little quiz').content as Quiz).quizId;
    const quiz3 = (adminQuizCreate(user1, 'Quiz3', '').content as Quiz).quizId;

    let quizRemove = adminQuizRemove(user1, quiz1);

    expect(quizRemove.statusCode).toStrictEqual(200);
    quizRemove = adminQuizRemove(user1, quiz2);
    expect(quizRemove.statusCode).toStrictEqual(200);
    quizRemove = adminQuizRemove(user1, quiz3);
    expect(quizRemove.statusCode).toStrictEqual(200);

    const success1 = adminQuizList(user1).content as QuizList;
    expect(success1).toStrictEqual({
      quizzes: [],
    });
  });
});
