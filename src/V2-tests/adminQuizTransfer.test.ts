import {
  adminAuthRegister,
  adminQuizSessionStart,
  adminQuizSessionStateUpdate,
  clear
} from '../testWrappersV1';

import {
  adminQuizTransfer,
  adminQuizCreate,
  adminUserDetails,
  adminQuizList,
  adminQuizCreateQuestion
} from '../testWrappersV2';

import { Quiz, QuizList, ReturnedToken, UserDetails } from '../types';

describe('adminQuizTransfer', () => {
  let user: ReturnedToken;
  let user2: ReturnedToken;
  let user2Email: string;
  let quiz: number;
  let questInfo;
  let questionId: number;

  const invalidToken = {
    token: '-1'
  };

  beforeEach(() => {
    clear();
    user = adminAuthRegister(
      'ryan@gmail.com',
      'password3213',
      'Ryan',
      'Huynh'
    ).content as ReturnedToken;

    quiz = (adminQuizCreate(
      user,
      'quiz',
      'description'
    ).content as Quiz).quizId;

    user2 = adminAuthRegister(
      'oth@gmail.com',
      'password4876',
      'oth',
      'other'
    ).content as ReturnedToken;

    questInfo = {
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
      thumbnailUrl: 'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg'
    };

    questionId = (
      adminQuizCreateQuestion(
        user,
        quiz,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers,
        questInfo.thumbnailUrl
      ).content as { questionId: number }
    ).questionId;
    expect(questionId).toStrictEqual(expect.any(Number));
    user2Email = (adminUserDetails(user2).content as UserDetails).user.email;
  });

  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    expect(
      adminQuizTransfer(quiz, invalidToken, user2Email)
    ).toStrictEqual({
      content: {
        error:
        'Token is empty or invalid (does not refer to valid logged in user session)'
      },
      statusCode: 401
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user3 = adminAuthRegister(
      'ran@mail.com',
      'dsadsadsa321',
      'Ran',
      'Huy'
    ).content as ReturnedToken;
    expect(adminQuizTransfer(quiz, user3, user2Email)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('QuizId does not exist', () => {
    const user3 = adminAuthRegister(
      'ran@mail.com',
      'dsadsadsa321',
      'Ran',
      'Huy'
    ).content as ReturnedToken;
    expect(adminQuizTransfer(quiz + 1, user3, user2Email)).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('userEmail is not a real user', () => {
    expect(
      adminQuizTransfer(quiz, user, 'notrealuser@gmail.com')
    ).toStrictEqual({
      content: {
        error: 'userEmail is not a real user'
      },
      statusCode: 400,
    });
  });

  test('userEmail is the current logged in user', () => {
    expect(
      adminQuizTransfer(quiz, user, 'ryan@gmail.com')
    ).toStrictEqual({
      content: {
        error: 'userEmail is the current logged in user'
      },
      statusCode: 400,
    });
  });

  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const quiz2 = (adminQuizCreate(
      user2,
      'quiz',
      'description'
    ).content as Quiz).quizId;

    expect(adminQuizTransfer(quiz2, user2, 'ryan@gmail.com')).toStrictEqual({
      content: {
        error: 'Quiz ID refers to a quiz that has a name that is already used by the target user'
      },
      statusCode: 400,
    });
  });

  test('Error: All sessions for this quiz must be in END state', () => {
    const session1 = adminQuizSessionStart(user, quiz, 3);
    expect(session1).toStrictEqual({
      statusCode: 200,
      content: {
        sessionId: expect.any(Number)
      }
    });

    expect(adminQuizTransfer(quiz, user, user2Email)).toStrictEqual({
      content: {
        error: 'All sessions for this quiz must be in END state'
      },
      statusCode: 400,
    });
  });

  test('Success: All sessions are in END state', () => {
    const session1 = adminQuizSessionStart(user, quiz, 3).content.sessionId;
    expect(session1).toStrictEqual(expect.any(Number));

    const toEndState = adminQuizSessionStateUpdate(user, quiz, session1, 'END');
    expect(toEndState.statusCode).toStrictEqual(200);

    expect(adminQuizTransfer(quiz, user, user2Email)).toStrictEqual({
      content: {},
      statusCode: 200,
    });
  });

  test('Success: User 2 currently has no quiz', () => {
    expect(adminQuizTransfer(quiz, user, user2Email)).toStrictEqual({
      content: {},
      statusCode: 200
    });

    expect((adminQuizList(user2).content as QuizList).quizzes).toStrictEqual([
      {
        quizId: expect.any(Number),
        name: 'quiz'
      }
    ]);
  });

  test('Success: User 2 currently has 1 quiz', () => {
    const quiz2 = (adminQuizCreate(
      user2,
      'quiz2',
      'description'
    ).content as Quiz).quizId;
    expect(quiz2).toStrictEqual(expect.any(Number));

    // Transfer user quiz to user2 quiz
    expect(adminQuizTransfer(quiz, user, user2Email)).toStrictEqual({
      content: {},
      statusCode: 200
    });

    // Check the quiz list of user2
    expect(new Set((adminQuizList(user2).content as QuizList).quizzes)).toStrictEqual(new Set([
      {
        quizId: expect.any(Number),
        name: 'quiz2'
      },
      {
        quizId: expect.any(Number),
        name: 'quiz'
      },
    ]));

    // Check the quiz list of user
    expect((adminQuizList(user).content as QuizList).quizzes).toStrictEqual([]);

    // -----------------------------------------------------------
    // Now transfer quiz2 of user2 to user
    expect(adminQuizTransfer(quiz2, user2, 'ryan@gmail.com')).toStrictEqual({
      content: {},
      statusCode: 200
    });

    // Check the quiz list of user
    expect((adminQuizList(user).content as QuizList).quizzes).toStrictEqual(([
      {
        quizId: expect.any(Number),
        name: 'quiz2'
      },
    ]));

    // Check the quiz list of user2
    expect((adminQuizList(user2).content as QuizList).quizzes).toStrictEqual([
      {
        quizId: expect.any(Number),
        name: 'quiz'
      }
    ]);
  });
});
