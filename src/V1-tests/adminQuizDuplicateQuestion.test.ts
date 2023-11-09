import {
  adminQuizCreate,
  adminAuthRegister,
  clear,
  adminQuizCreateQuestion,
  adminQuizInfo,
  adminQuizDuplicateQuestion,
} from '../testWrappersV1';
import { Question, Quiz, QuizObject, ReturnedToken } from '../types';
import { getCurrentTimestamp } from '../quizHelper';
import { expect, test } from '@jest/globals';

describe('adminQuizDuplicateQuestion', () => {
  let user: ReturnedToken;
  let quiz: Quiz;
  let questInfo: Question;
  let question: Question;
  beforeEach(() => {
    clear();
    user = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
      .content as ReturnedToken;
    quiz = adminQuizCreate(user, 'Quiz 1', 'Description').content as Quiz;
    questInfo = {
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
    };
    question = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    ).content as Question;
  });

  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const invalidToken = {
      token: '-1',
    };

    const result = adminQuizDuplicateQuestion(
      invalidToken,
      quiz.quizId,
      question.questionId
    );

    expect(result).toStrictEqual({
      statusCode: 401,
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
    });
  });

  test(' Valid token is provided, but user is not an owner of this quiz', () => {
    const result = adminQuizDuplicateQuestion(
      user,
      quiz.quizId + 1,
      question.questionId
    );

    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
    });
  });

  test('Question ID does not refer to a valid question within this quiz', () => {
    const result = adminQuizDuplicateQuestion(
      user,
      quiz.quizId,
      question.questionId + 1
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error:
          'Question Id does not refer to a valid question within this quiz',
      },
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = adminAuthRegister(
      'thang@gmail.com',
      '0105uwuwuw',
      'Thomas',
      'Nguyen'
    ).content as ReturnedToken;

    const quiz2 = adminQuizCreate(user2, 'New Quiz 2', 'long description')
      .content as Quiz;

    const result = adminQuizDuplicateQuestion(
      user,
      quiz2.quizId,
      question.questionId
    );
    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
    });
  });

  test('Success case: duplicate 1 question', () => {
    const result = adminQuizDuplicateQuestion(
      user,
      quiz.quizId,
      question.questionId
    );

    expect(result).toStrictEqual({
      statusCode: 200,
      content: {
        newQuestionId: 1,
      },
    });

    const quizInfo = adminQuizInfo(user, quiz.quizId).content as QuizObject;
    expect(quizInfo.numQuestions).toStrictEqual(2);
    expect(quizInfo.duration).toStrictEqual(8);
    expect(quizInfo.questions[0].answers).toStrictEqual(
      quizInfo.questions[1].answers
    );
    expect(quizInfo.questions[0].points).toStrictEqual(
      quizInfo.questions[1].points
    );
    expect(quizInfo.questions[0].question).toStrictEqual(
      quizInfo.questions[1].question
    );
    expect(quizInfo.questions[0].duration).toStrictEqual(
      quizInfo.questions[1].duration
    );
    const currTimeStamp = getCurrentTimestamp();
    const timeLastEdited = quizInfo.timeLastEdited;
    expect(currTimeStamp - timeLastEdited).toBeLessThanOrEqual(1);
  });

  test('Success case: duplicate 2 question', () => {
    const result1 = adminQuizDuplicateQuestion(
      user,
      quiz.quizId,
      question.questionId
    );

    expect(result1).toStrictEqual({
      statusCode: 200,
      content: {
        newQuestionId: 1,
      },
    });

    const result2 = adminQuizDuplicateQuestion(
      user,
      quiz.quizId,
      question.questionId
    );

    expect(result2).toStrictEqual({
      statusCode: 200,
      content: {
        newQuestionId: 2,
      },
    });
    const quizInfo = adminQuizInfo(user, quiz.quizId).content as QuizObject;
    expect(quizInfo.numQuestions).toStrictEqual(3);
    expect(quizInfo.duration).toStrictEqual(12);
    expect(quizInfo.questions[0].questionId).toStrictEqual(0);
    expect(quizInfo.questions[1].questionId).toStrictEqual(2);
    expect(quizInfo.questions[2].questionId).toStrictEqual(1);

    expect(quizInfo.questions[1].answers).toStrictEqual(
      quizInfo.questions[0].answers
    );
    expect(quizInfo.questions[1].points).toStrictEqual(
      quizInfo.questions[0].points
    );
    expect(quizInfo.questions[1].question).toStrictEqual(
      quizInfo.questions[0].question
    );
    expect(quizInfo.questions[1].duration).toStrictEqual(
      quizInfo.questions[0].duration
    );

    expect(quizInfo.questions[2].answers).toStrictEqual(
      quizInfo.questions[0].answers
    );
    expect(quizInfo.questions[2].points).toStrictEqual(
      quizInfo.questions[0].points
    );
    expect(quizInfo.questions[2].question).toStrictEqual(
      quizInfo.questions[0].question
    );
    expect(quizInfo.questions[2].duration).toStrictEqual(
      quizInfo.questions[0].duration
    );

    const currTimeStamp = getCurrentTimestamp();
    const timeLastEdited = quizInfo.timeLastEdited;
    expect(currTimeStamp - timeLastEdited).toBeLessThanOrEqual(1);
  });
});
