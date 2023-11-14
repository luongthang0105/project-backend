import {
  adminAuthRegister,
  clear,
  adminAuthLogout,
  adminQuizSessionStart,
  adminQuizGetSessionStatus,
} from '../testWrappersV1';
import { adminQuizCreate, adminQuizCreateQuestion, adminQuizInfo } from '../testWrappersV2';
import { Question, Quiz, ReturnedToken } from '../types';

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
  quiz1 = adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz')
    .content as Quiz;
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
  quizSession1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content
    .sessionId;
});

describe('adminQuizGetSessionStatus', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session): Logged out session', () => {
    adminAuthLogout(user1);
    const result = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1);
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
    const result = adminQuizGetSessionStatus(
      unavailableToken,
      quiz1.quizId,
      quizSession1
    );
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });
  test('Session Id does not refer to a valid session within this quiz', () => {
    const result = adminQuizGetSessionStatus(
      user1,
      quiz1.quizId,
      quizSession1 + 1
    );
    expect(result).toStrictEqual({
      content: {
        error: 'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400,
    });
  });
  test('Session Id does not refer to a valid session within this quiz: 2 quizzes', () => {
    const quiz2 = adminQuizCreate(user1, 'NewQuiz', 'nice quiz').content as Quiz;
    const quizSession2 = adminQuizSessionStart(user1, quiz2.quizId, 3).content.sessionId;
    const result1 = adminQuizGetSessionStatus(
      user1,
      quiz1.quizId,
      quizSession2
    );
    expect(result1).toStrictEqual({
      content: {
        error: 'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400,
    });
    const result2 = adminQuizGetSessionStatus(
      user1,
      quiz2.quizId,
      quizSession1
    );
    expect(result2).toStrictEqual({
      content: {
        error: 'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400,
    });
  });
  test('Valid token is provided, but user is not authorised to view this session', () => {
    const user2 = adminAuthRegister(
      'muttsuki@gmail.com',
      '2705t3huwu',
      'Type',
      'Script'
    ).content as ReturnedToken;
    const result = adminQuizGetSessionStatus(user2, quiz1.quizId, quizSession1);
    expect(result).toStrictEqual({
      content: {
        error:
          'Valid token is provided, but user is not authorised to view this session',
      },
      statusCode: 403,
    });
  });

  test('Valid token is provided, but user is not authorised to view this session: non-existent quizId', () => {
    const result = adminQuizGetSessionStatus(user1, quiz1.quizId + 1, quizSession1);
    expect(result).toStrictEqual({
      content: {
        error:
          'Valid token is provided, but user is not authorised to view this session',
      },
      statusCode: 403,
    });
  });

  test('SUCCESS: Quiz with 1 question', () => {
    const result = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession1);
    const quizTimeCreated = adminQuizInfo(user1, quiz1.quizId).content
      .timeCreated;
    const quizTimeLastEdited = adminQuizInfo(user1, quiz1.quizId).content
      .timeLastEdited;

    expect(result).toStrictEqual({
      content: {
        state: 'LOBBY',
        atQuestion: 0,
        players: [],
        metadata: {
          quizId: quiz1.quizId,
          name: 'Hihihihihih',
          timeCreated: quizTimeCreated,
          timeLastEdited: quizTimeLastEdited,
          description: 'This is my quiz',
          numQuestions: 1,
          questions: [
            {
              questionId: question1,
              question: 'What is that pokemon',
              duration: 4,
              thumbnailUrl: 'https://as2.ftcdn.net/v2/jpg/00/97/58/97/1000_F_97589769_t45CqXyzjz0KXwoBZT9PRaWGHRk5hQqQ.jpg',
              points: 5,
              answers: [
                {
                  answerId: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].answers[0].answerId,
                  answer: 'Pikachu',
                  colour: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].answers[0].colour,
                  correct: true,
                },
                {
                  answerId: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].answers[1].answerId,
                  answer: 'Thomas',
                  colour: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].answers[1].colour,
                  correct: false,
                },
              ],
            },
          ],
          duration: 4,
          thumbnailUrl: '',
        },
      },
      statusCode: 200,
    });
  });
  /*
  test("SUCCESS: Quiz with 2 questions", () => {
    const questInfo2 = {
      question: "What is pink?",
      duration: 4,
      thumbnailUrl: "http://google.com//image/path.jpg",
      points: 5,
      answers: [
        {
          answerId: adminQuizInfo(user1, quiz1.quizId).content.questions[0]
            .answers[0].answerId,
          answer: "Pink",
          colour: adminQuizInfo(user1, quiz1.quizId).content.questions[0]
            .answers[0].colour,
          correct: true,
        },
        {
          answerId: adminQuizInfo(user1, quiz1.quizId).content.questions[0]
            .answers[1].answerId,
          answer: "Green",
          colour: adminQuizInfo(user1, quiz1.quizId).content.questions[0]
            .answers[1].colour,
          correct: false,
        },
      ],
    };
    const question2 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo2.question,
      questInfo2.duration,
      questInfo2.points,
      questInfo2.answers,
      questInfo2.thumbnailUrl
    ).content.questionId;
    const quizSession2 = adminQuizSessionStart(user1, quiz1.quizId, 5).content
      .sessionId;
    const result = adminQuizGetSessionStatus(user1, quiz1.quizId, quizSession2);
    const quizTimeCreated = adminQuizInfo(user1, quiz1.quizId).content
      .timeCreated;
    const quizTimeLastEdited = adminQuizInfo(user1, quiz1.quizId).content
      .timeLastEdited;
    expect(result).toStrictEqual({
      content: {
        state: "LOBBY",
        atQuestion: 0,
        players: [],
        metadata: {
          quizId: quiz1.quizId,
          name: "Hihihihihih",
          timeCreated: quizTimeCreated,
          timeLastEdited: quizTimeLastEdited,
          description: "This is my quiz",
          numQuestions: 2,
          questions: [
            {
              questionId: question1,
              question: "What is that pokemon",
              duration: 4,
              thumbnailUrl: "http://google.com//image/path.jpg",
              points: 5,
              answers: [
                {
                  answerId: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].duration,
                  answer: "Pikachu",
                  colour: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].answers[0].colour,
                  correct: true,
                },
                {
                  answerId: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].answers[1].answerId,
                  answer: "Thomas",
                  colour: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[0].answers[1].colour,
                  correct: false,
                },
              ],
            },
            {
              questionId: question2,
              question: "What is pink?",
              duration: 4,
              points: 5,
              answers: [
                {
                  answerId: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[1].answers[0].answerId,
                  answer: "Pink",
                  colour: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[1].answers[0].colour,
                  correct: true,
                },
                {
                  answerId: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[1].answers[1].answerId,
                  answer: "Green",
                  colour: adminQuizInfo(user1, quiz1.quizId).content
                    .questions[1].answers[1].colour,
                  correct: false,
                },
              ],
            },
          ],
          duration: 8,
          thumbnailUrl: "",
        },
      },
      statusCode: 200,
    });
  });
  */
});
