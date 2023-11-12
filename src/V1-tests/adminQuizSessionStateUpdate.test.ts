import {
  adminAuthRegister,
  clear,
  adminAuthLogout,
  adminQuizSessionStart,
  adminQuizGetSessionStatus,
  adminQuizSessionStateUpdate
} from '../testWrappersV1';
import { adminQuizCreate, adminQuizCreateQuestion, adminQuizInfo } from '../testWrappersV2';
import { Question, Quiz, ReturnedToken } from '../types';
import { jest } from '@jest/globals';

jest.useFakeTimers();
let user1: ReturnedToken;
let quiz1: Quiz;
let questInfo1: Question;
let question1: number;
let quizSession1: number;
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
    thumbnailUrl: 'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
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
  };
  question1 = adminQuizCreateQuestion(
    user1,
    quiz1.quizId,
    questInfo1.question,
    questInfo1.duration,
    questInfo1.points,
    questInfo1.answers,
    questInfo1.thumbnailUrl
  ).content.questionId;
  quizSession1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
});

describe('adminQuizGetSessionStatus', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): Logged out session', () => {
    adminAuthLogout(user1);
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
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
    const result = adminQuizSessionStateUpdate(unavailableToken, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
            'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });
  test('Session Id does not refer to a valid session within this quiz', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1 + 1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
            'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400
      ,
    });
  });
  test('Session Id does not refer to a valid session within this quiz', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1 + 1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
            'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400
      ,
    });
  });  
  test('Session Id does not refer to a valid session within this quiz: 2 quizzes', () => {
    const quiz2 = adminQuizCreate(user1, 'NewQuiz', 'nice quiz').content as Quiz;
    const quizSession2 = adminQuizSessionStart(user1, quiz2.quizId, 3).content.sessionId;
    const result1 = adminQuizSessionStateUpdate(
      user1,
      quiz1.quizId,
      quizSession2,
      'NEXT_QUESTION'
    );
    expect(result1).toStrictEqual({
      content: {
        error: 'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400,
    });
    const result2 = adminQuizSessionStateUpdate(
      user1,
      quiz2.quizId,
      quizSession1,
      'NEXT_QUESTION'
    );
    expect(result2).toStrictEqual({
      content: {
        error: 'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400,
    });
  });
  test('Action provided is not a valid Action enum', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NO_SUCH_ACTION');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action provided is not a valid Action enum',
      },
      statusCode: 400
      ,
    });
  });
  test('Action provided is not a valid Action enum: case insensitive', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'next_question');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action provided is not a valid Action enum',
      },
      statusCode: 400
      ,
    });
  });
  // Action enums that cannot be applied to LOBBY
  test('Action enum cannot be applied in the current state: LOBBY => SKIP_COUNTDOWN', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });

  test('Action enum cannot be applied in the current state: LOBBY => GO_TO_ANSWER', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });

  test('Action enum cannot be applied in the current state: LOBBY => GO_TO_FINAL_RESULTS', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  // Action enums that cannot be applied to QUESTION_COUNTDOWN
  test('Action enum cannot be applied in the current state: QUESTION_COUNTDOWN => NEXT_QUESTION', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });

  test('Action enum cannot be applied in the current state: QUESTION_COUNTDOWN => GO_TO_ANSWER', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });

  test('Action enum cannot be applied in the current state: QUESTION_COUNTDOWN => GO_TO_FINAL_RESULTS', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });

  // Action enums that cannot be applied to QUESTION_OPEN
  test('Action enum cannot be applied in the current state: QUESTION_OPEN => NEXT_QUESTION', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });

  test('Action enum cannot be applied in the current state: QUESTION_OPEN => SKIP_COUNTDOWN', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });

  test('Action enum cannot be applied in the current state: QUESTION_OPEN => GO_TO_FINAL_RESULTS', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  // Action enums that cannot be applied to QUESTION_CLOSE
  test('Action enum cannot be applied in the current state: QUESTION_CLOSE => NEXT_QUESTION', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result = setTimeout(adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION'), 4000);
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: QUESTION_CLOSE => SKIP_COUNTDOWN', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result = setTimeout(adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN'), 4000);
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  // Action enums that cannot be applied to  ANSWER_SHOW
  test('Action enum cannot be applied in the current state: ANSWER_SHOW => SKIP_COUNTDOWN', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: ANSWER_SHOW => ANSWER_SHOW', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'ANSWER_SHOW');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  // Action enums that cannot be applied to FINAL_RESULTS
  test('Action enum cannot be applied in the current state: FINAL_RESULTS => NEXT_QUESTION', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: FINAL_RESULTS => SKIP_COUNTDOWN', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: FINAL_RESULTS => GO_TO_ANSWER', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: FINAL_RESULTS => GO_TO_FINAL_RESULTS', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  // Action enums that cannot be applied to END
  test('Action enum cannot be applied in the current state: END => NEXT_QUESTION', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'END');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: END => SKIP_COUNTDOWN', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'END');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: END => GO_TO_ANSWER', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'END');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: END => GO_TO_FINAL_RESULTS', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'END');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  test('Action enum cannot be applied in the current state: END => END', () => {
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'END');
    const result = adminQuizUpdateSessionState(user1, quiz1.quizId, quizSession1, 'END');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
});

