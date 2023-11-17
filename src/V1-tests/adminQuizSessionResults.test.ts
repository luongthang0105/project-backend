import {
  adminAuthRegister,
  clear,
  adminAuthLogout,
  adminQuizSessionStart,
  adminQuizGetSessionStatus,
  adminQuizSessionStateUpdate,
  adminQuizSessionResults,
  playerJoinSession,
  adminQuizInfo,
  playerSubmission
} from '../testWrappersV1';
import { adminQuizCreate, adminQuizCreateQuestion } from '../testWrappersV2';
import { Question, Quiz, ReturnedToken } from '../types'
import { sleepSync } from './sleepSync';

let user1: ReturnedToken;
let quiz1: Quiz;
let questInfo1: Question;
let questInfo2: Question;
let question1: number;
let question2: number;
let quizSession1: number;
const duration = 4;

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
    duration: duration,
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
  questInfo2 = {
    question: 'Are penguins birds?',
    duration: duration,
    thumbnailUrl: 'https://as2./97/penguinQ.jpg',
    points: 4,
    answers: [
      {
        answer: 'Yes',
        correct: true,
      },
      {
        answer: 'No',
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
  question2 = adminQuizCreateQuestion(
    user1,
    quiz1.quizId,
    questInfo2.question,
    questInfo2.duration,
    questInfo2.points,
    questInfo2.answers,
    questInfo2.thumbnailUrl
  ).content.questionId;
  quizSession1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;

});

describe('adminQuizSessionResults', () => { 
  test('Token is empty or invalid (does not refer to valid logged in user session): Logged out session', () => {
    adminAuthLogout(user1);
    const result = adminQuizSessionResults(user1, quiz1.quizId, quizSession1);
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
    const result = adminQuizSessionResults(unavailableToken, quiz1.quizId, quizSession1);
    expect(result).toStrictEqual({
      content: {
        error:
            'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });
  test('Session Id does not refer to a valid session within this quiz', () => {
    const result = adminQuizSessionResults(user1, quiz1.quizId, quizSession1 + 1);
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
    const result1 = adminQuizSessionResults(
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
    const result2 = adminQuizSessionResults(
      user1,
      quiz2.quizId,
      quizSession1,
    );
    expect(result2).toStrictEqual({
      content: {
        error: 'Session Id does not refer to a valid session within this quiz',
      },
      statusCode: 400,
    });
  });
  test('Session is not in FINAL_RESULTS state', () => { 
    const result = adminQuizSessionResults(user1, quiz1.quizId, quizSession1);
    expect(result).toStrictEqual({
      content: {
        error:
            'Session is not in FINAL_RESULTS state',
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
    const result = adminQuizSessionResults(user2, quiz1.quizId, quizSession1);
    expect(result).toStrictEqual({
      content: {
        error:
          'Valid token is provided, but user is not authorised to view this session',
      },
      statusCode: 403,
    });
  });

  test('Valid token is provided, but user is not authorised to view this session: non-existent quizId', () => {
    const result = adminQuizSessionResults(user1, quiz1.quizId + 1, quizSession1);
    expect(result).toStrictEqual({
      content: {
        error:
          'Valid token is provided, but user is not authorised to view this session',
      },
      statusCode: 403,
    });
  });
  test('Success:', () => {
    const player1 = playerJoinSession(quizSession1, 'Mutsuki').content.playerId;
    const player2 = playerJoinSession(quizSession1, 'Thomas').content.playerId;    
    const player3 = playerJoinSession(quizSession1, 'Han').content.playerId;
    const answerId1 = adminQuizInfo(user1, quiz1.quizId).content.questions[0].answers[0].answerId as number;
    const answerId2 = adminQuizInfo(user1, quiz1.quizId).content.questions[1].answers[0].answerId as number;
    const answerId3 = adminQuizInfo(user1, quiz1.quizId).content.questions[1].answers[1].answerId as number;
    const answer1 = [answerId1];
    const answer2 = [answerId2];
    const answer3 = [answerId3];
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    sleepSync(1);
    playerSubmission(answer1, player1, 1);
    sleepSync(1);
    playerSubmission(answer1, player2, 1);
    sleepSync(1);
    playerSubmission(answer1, player3, 1);
    sleepSync(1);
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'NEXT_QUESTION');
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'SKIP_COUNTDOWN');
    sleepSync(1);
    playerSubmission(answer2, player1, 2);
    sleepSync(1);
    playerSubmission(answer3, player2, 2);
    sleepSync(1);
    playerSubmission(answer3, player3, 2);
    sleepSync(1);
    adminQuizSessionStateUpdate(user1, quiz1.quizId, quizSession1, 'GO_TO_FINAL_RESULTS');
    const result = adminQuizSessionResults(user1, quiz1.quizId, quizSession1).content;
    expect(result).toStrictEqual({
      usersRankedByScore: [
        {
          name: 'Mutsuki',
          score: 9
        },
        {
          name: 'Thomas',
          score: 5
        },
        {
          name: 'Han',
          score: 5
        }
      ],
      questionResults: [
        {
          questionId: question1,
          playersCorrectList: [
            'Mutsuki', 'Thomas', 'Han'
          ],
          averageAnswerTime: 1,
          percentCorrect: 100
        },
        {
          questionId: question2,
          playersCorrectList: [
            'Mutsuki'
          ],
          averageAnswerTime: 1,
          percentCorrect: 33
        },
      ]
    })
  });
  test('Success multiple answers', () => {
    const quiz2 = adminQuizCreate(user1, 'QuizNew', 'Great Quiz').content as Quiz;
    const questInfo3 = {
      question: 'Which of these are birds?',
      duration: duration,
      thumbnailUrl: 'https://as2uugugbh./97/penguinQ.jpg',
      points: 5,
      answers: [
        {
          answer: 'Lion',
          correct: false,
        },
        {
          answer: 'Duck',
          correct: true,
        },
        {
          answer: 'Penguin',
          correct: true,
        },
        {
          answer: 'Tiger',
          correct: false,
        },
      ],
    };
    const question3 = adminQuizCreateQuestion(
      user1,
      quiz2.quizId,
      questInfo3.question,
      questInfo3.duration,
      questInfo3.points,
      questInfo3.answers,
      questInfo3.thumbnailUrl
    ).content.questionId;
    const answerId1 = adminQuizInfo(user1, quiz2.quizId).content.questions[0].answers[0].answerId as number;
    const answerId2 = adminQuizInfo(user1, quiz2.quizId).content.questions[0].answers[1].answerId as number;
    const answerId3 = adminQuizInfo(user1, quiz2.quizId).content.questions[0].answers[2].answerId as number;
    const answerId4 = adminQuizInfo(user1, quiz2.quizId).content.questions[0].answers[3].answerId as number;
    const answer1 = [answerId1, answerId3];
    const answer2 = [answerId2, answerId4];
    const quizSession2 = adminQuizSessionStart(user1, quiz2.quizId, 2).content.sessionId;
    const player1 = playerJoinSession(quizSession2, 'Mutsuki').content.playerId;
    const player2 = playerJoinSession(quizSession2, 'Thomas').content.playerId;
    adminQuizSessionStateUpdate(user1, quiz2.quizId, quizSession2, 'SKIP_COUNTDOWN');
    sleepSync(2);
    playerSubmission(answer1, player1, 1);
    sleepSync(1);
    playerSubmission(answer2, player2, 1);
    sleepSync(1);
    adminQuizSessionStateUpdate(user1, quiz2.quizId, quizSession2, 'GO_TO_FINAL_RESULTS');
    const result = adminQuizSessionResults(user1, quiz1.quizId, quizSession1).content;
    expect(result).toStrictEqual({
      usersRankedByScore: [
        {
          name: 'Mutsuki',
          score: 5
        },
        {
          name: 'Thomas',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: question3,
          playersCorrectList: [
            'Mutsuki'
          ],
          averageAnswerTime: 2,
          percentCorrect: 50
        }
      ]
    })
  });
});

