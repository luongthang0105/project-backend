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

describe.only('adminQuizGetSessionStatus', () => {
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
  test('Valid token is provided, but user is not authorised to view this session', () => {
    const user2 = adminAuthRegister(
      'muttsuki@gmail.com',
      '2705t3huwu',
      'Type',
      'Script'
    ).content as ReturnedToken;
    const result = adminQuizSessionStateUpdate(user2, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
          'Valid token is provided, but user is not authorised to view this session',
      },
      statusCode: 403,
    });
  });

  test('Valid token is provided, but user is not authorised to view this session: non-existent quizId', () => {
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId + 1, quizSession1, 'NEXT_QUESTION');
    expect(result).toStrictEqual({
      content: {
        error:
          'Valid token is provided, but user is not authorised to view this session',
      },
      statusCode: 403,
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
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
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
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
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

  test('Action enum cannot be applied in the current state: QUESTION_COUNTDOWN => GO_TO_FINAL_RESULTS', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
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

  // Action enums that cannot be applied to QUESTION_OPEN
  test('Action enum cannot be applied in the current state: QUESTION_OPEN => NEXT_QUESTION', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
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
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
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

  test('Action enum cannot be applied in the current state: QUESTION_OPEN => GO_TO_FINAL_RESULTS', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });-
  // Action enums that cannot be applied to QUESTION_CLOSE
  test('Action enum cannot be applied in the current state: QUESTION_CLOSE => NEXT_QUESTION', async () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    setTimeout(() => {
      const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION')
      expect(result).toStrictEqual({
        content: {
          error:
            'Action enum cannot be applied in the current state',
        },
        statusCode: 400
        ,
      });
    }, 4000);

  });
  test('Action enum cannot be applied in the current state: QUESTION_CLOSE => SKIP_COUNTDOWN', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    setTimeout(() => {
      const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
      expect(result).toStrictEqual({
        content: {
          error:
            'Action enum cannot be applied in the current state',
        },
        statusCode: 400
        ,
      });
    }, 4000);
  });
  // Action enums that cannot be applied to  ANSWER_SHOW
  test('Action enum cannot be applied in the current state: ANSWER_SHOW => SKIP_COUNTDOWN', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
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
  test('Action enum cannot be applied in the current state: ANSWER_SHOW => GO_TO_ANSWER', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
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
  // Action enums that cannot be applied to FINAL_RESULTS
  test('Action enum cannot be applied in the current state: FINAL_RESULTS => NEXT_QUESTION', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
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
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
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
  test('Action enum cannot be applied in the current state: FINAL_RESULTS => GO_TO_ANSWER', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
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
  test('Action enum cannot be applied in the current state: FINAL_RESULTS => GO_TO_FINAL_RESULTS', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
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
  // Action enums that cannot be applied to END
  test('Action enum cannot be applied in the current state: END => NEXT_QUESTION', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
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
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
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
  test('Action enum cannot be applied in the current state: END => GO_TO_ANSWER', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
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
  test('Action enum cannot be applied in the current state: END => GO_TO_FINAL_RESULTS', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
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
  test('Action enum cannot be applied in the current state: END => END', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    const result = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    expect(result).toStrictEqual({
      content: {
        error:
          'Action enum cannot be applied in the current state',
      },
      statusCode: 400
      ,
    });
  });
  // Successful state update: LOBBY
  test('SUCCESS: LOBBY => NEXT_QUESTION', () => {
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
    expect(result1).toStrictEqual({
      content: {},
      statusCode: 200
      ,
    });
    expect(result2).toStrictEqual('QUESTION_COUNTDOWN');
  });
  test('SUCCESS: LOBBY => NEXT_QUESTION => 3seconds', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    setTimeout(() => {
      const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result2).toStrictEqual('QUESTION_OPEN');
    }, 3000);
  });
  test('SUCCESS: LOBBY => END', () => {
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
    expect(result1).toStrictEqual({
      content: {},
      statusCode: 200
      ,
    });
    expect(result2).toStrictEqual('END');
  });
  // Successful state update: QUESTION_COUNTDOWN
  test('SUCCESS: QUESTION_COUNTDOWN => SKIP_COUNTDOWN', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
    expect(result1).toStrictEqual({
      content: {},
      statusCode: 200
      ,
    });
    expect(result2).toStrictEqual('QUESTION_OPEN');
  });
  test('SUCCESS: QUESTION_COUNTDOWN => END', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
    expect(result1).toStrictEqual({
      content: {},
      statusCode: 200
      ,
    });
    expect(result2).toStrictEqual('END');
  });
  // Successful state update: QUESTION_OPEN
  test('SUCCESS: QUESTION_OPEN => GO_TO_ANSWER', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    expect(adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state).toBe('QUESTION_COUNTDOWN')
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN')
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result1).toStrictEqual({
        content: {},
        statusCode: 200
        ,
      });
      expect(result2).toStrictEqual('ANSWER_SHOW');
  });
  test('SUCCESS: QUESTION_OPEN => END', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result1).toStrictEqual({
        content: {},
        statusCode: 200
        ,
      });
      expect(result2).toStrictEqual('END');
  });
  test('SUCCESS: QUESTION_OPEN => duration', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    setTimeout(() => {
      const result1 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result1).toStrictEqual('QUESTION_CLOSE');    
    }, 4000);
  });
  // Successful state update: QUESTION_CLOSE
  test('SUCCESS: QUESTION_CLOSE => SKIP_COUNTDOWN', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    setTimeout(() => {
      const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
      const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
        expect(result1).toStrictEqual({
          content: {},
          statusCode: 200
          ,
        });
        expect(result2).toStrictEqual('ANSWER_SHOW');
    }, 4000);
  });
  test('SUCCESS: QUESTION_CLOSE => GO_TO_FINAL_RESULTS', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    setTimeout(() => {
      const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
      const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
        expect(result1).toStrictEqual({
          content: {},
          statusCode: 200
          ,
        });
        expect(result2).toStrictEqual('FINAL_RESULTS');
    }, 4000);
  });
  test('SUCCESS: QUESTION_CLOSE => END', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    setTimeout(() => {
      const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
      const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
        expect(result1).toStrictEqual({
          content: {},
          statusCode: 200
          ,
        });
        expect(result2).toStrictEqual('END');
    }, 4000);
  });
  // Successful state update: ANSWER_SHOW
  test('SUCCESS: ANSWER_SHOW => NEXT_QUESTION', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result1).toStrictEqual({
        content: {},
        statusCode: 200
        ,
      });
      expect(result2).toStrictEqual('QUESTION_COUNTDOWN');
  });
  test('SUCCESS: ANSWER_SHOW => GO_TO_FINAL_RESULTS', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result1).toStrictEqual({
        content: {},
        statusCode: 200
        ,
      });
      expect(result2).toStrictEqual('FINAL_RESULTS');
  });
  test('SUCCESS: ANSWER_SHOW => END', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result1).toStrictEqual({
        content: {},
        statusCode: 200
        ,
      });
      expect(result2).toStrictEqual('END');
  });
  // Successful state update: FINAL_RESULTS
  test('SUCCESS: ANSWER_SHOW => NEXT_QUESTION', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_ANSWER');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result1 = adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'END');
    const result2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
      expect(result1).toStrictEqual({
        content: {},
        statusCode: 200
        ,
      });
      expect(result2).toStrictEqual('END');
  });
  // Successful state update: 
  test.only('SUCCESS: ', () => {
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    const state1 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
    expect(state1).toStrictEqual('QUESTION_COUNTDOWN');
    setTimeout(() => {
    }, 5000);
    const state2 = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1).content.state;
    expect(state2).toStrictEqual('b');
  });
});

