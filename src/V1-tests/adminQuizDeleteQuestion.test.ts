import { getCurrentTimestamp } from '../quizHelper';
import {
  adminQuizCreate,
  adminAuthRegister,
  clear,
  adminQuizCreateQuestion,
  adminQuizInfo,
  adminQuizDeleteQuestion,
} from '../testWrappersV1';
import { Question, Quiz, QuizObject, ReturnedToken } from '../types';

import './toHaveValidColour';
import { expect, test } from '@jest/globals';

describe('adminQuizDeleteQuestion', () => {
  let user: ReturnedToken;
  let quizId: number;
  let questInfo: Question;
  let questionId: number;

  beforeEach(() => {
    clear();
    user = adminAuthRegister('han@gmai.com', '2705uwuwuwu', 'Han', 'Hanh')
      .content as ReturnedToken;
    quizId = (adminQuizCreate(user, 'Quiz 1', 'Description').content as Quiz).quizId;
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

    questionId = (
      adminQuizCreateQuestion(
        user,
        quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      ).content as { questionId: number }
    ).questionId;
  });

  test('Error: Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const invalidToken = {
      token: '-1'
    };
    const result = adminQuizDeleteQuestion(invalidToken, quizId, questionId);
    expect(result).toStrictEqual({
      statusCode: 401,
      content: {
        error: 'Token is empty or invalid (does not refer to valid logged in user session)'
      }
    });
  });

  test('Error: Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = adminAuthRegister('thang@gmai.com', '2705uwuwuwu', 'Thomas', 'Ngu').content as ReturnedToken;

    const result = adminQuizDeleteQuestion(user2, quizId, questionId);
    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz'
      }
    });
  });

  test('Error: Question Id does not refer to a valid question within this quiz', () => {
    const result = adminQuizDeleteQuestion(user, quizId, questionId + 1);
    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'Question Id does not refer to a valid question within this quiz'
      }
    });
  });

  test('Success: Successfully delete a question, 1 question only', () => {
    const currentTime = getCurrentTimestamp();
    const result = adminQuizDeleteQuestion(user, quizId, questionId);
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    const quizInfo = (adminQuizInfo(user, quizId).content as QuizObject);

    const timeLastEdited = quizInfo.timeLastEdited;
    expect(timeLastEdited - currentTime).toBeLessThanOrEqual(1);

    expect(quizInfo.numQuestions).toStrictEqual(0);
    expect(quizInfo.questions).toStrictEqual([]);
    expect(quizInfo.duration).toStrictEqual(0);
  });

  test('Success: Successfully delete a question, 2 questions, delete first one', () => {
    const questionId2 = (
      (adminQuizCreateQuestion(
        user,
        quizId,
        'What dat pokemon',
        50,
        1,
        [
          { answer: 'Pukachi', correct: true },
          { answer: 'Han', correct: false },
          { answer: 'Charmander', correct: false },
        ]
      )
    ).content as {questionId: number}).questionId;

    const currentTime = getCurrentTimestamp();
    const result = adminQuizDeleteQuestion(user, quizId, questionId);
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    const quizInfo = (adminQuizInfo(user, quizId).content as QuizObject);

    const timeLastEdited = quizInfo.timeLastEdited;
    expect(timeLastEdited - currentTime).toBeLessThanOrEqual(1);

    expect(quizInfo.numQuestions).toStrictEqual(1);
    expect(quizInfo.questions).toStrictEqual([
      {
        questionId: questionId2,
        question: 'What dat pokemon',
        duration: 50,
        points: 1,
        answers: [
          { answer: 'Pukachi', correct: true, answerId: expect.any(Number), colour: expect.toHaveValidColour() },
          { answer: 'Han', correct: false, answerId: expect.any(Number), colour: expect.toHaveValidColour() },
          { answer: 'Charmander', correct: false, answerId: expect.any(Number), colour: expect.toHaveValidColour() },
        ]
      }
    ]);
    expect(quizInfo.duration).toStrictEqual(50);
  });

  test('Success: Successfully delete a question, 2 questions, delete second one', () => {
    const questionId2 = (
      adminQuizCreateQuestion(
        user,
        quizId,
        'What dat pokemon',
        50,
        1,
        [
          { answer: 'Pukachi', correct: true },
          { answer: 'Han', correct: false },
          { answer: 'Charmander', correct: false },
        ]
      ).content as { questionId: number }
    ).questionId;

    const currentTime = getCurrentTimestamp();
    const result = adminQuizDeleteQuestion(user, quizId, questionId2);
    expect(result).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    const quizInfo = (adminQuizInfo(user, quizId).content as QuizObject);

    const timeLastEdited = quizInfo.timeLastEdited;
    expect(timeLastEdited - currentTime).toBeLessThanOrEqual(1);

    expect(quizInfo.numQuestions).toStrictEqual(1);
    expect(quizInfo.questions).toStrictEqual([
      {
        questionId: questionId,
        question: 'What is that pokemon',
        duration: 4,
        points: 5,
        answers: [
          { answer: 'Pikachu', correct: true, answerId: expect.any(Number), colour: expect.toHaveValidColour() },
          { answer: 'Thomas', correct: false, answerId: expect.any(Number), colour: expect.toHaveValidColour() }
        ]
      }
    ]);
    expect(quizInfo.duration).toStrictEqual(4);
  });

  test('Success: Successfully delete a question, 2 questions, delete both in numeric order ', () => {
    const questionId2 = (
      adminQuizCreateQuestion(
        user,
        quizId,
        'What dat pokemon',
        50,
        1,
        [
          { answer: 'Pukachi', correct: true },
          { answer: 'Han', correct: false },
          { answer: 'Charmander', correct: false },
        ]
      ).content as { questionId: number }
    ).questionId;

    const result = adminQuizDeleteQuestion(user, quizId, questionId);

    const currentTime = getCurrentTimestamp();

    const result2 = adminQuizDeleteQuestion(user, quizId, questionId2);

    expect(result).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    expect(result2).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    const quizInfo = (adminQuizInfo(user, quizId).content as QuizObject);

    const timeLastEdited = quizInfo.timeLastEdited;
    expect(timeLastEdited - currentTime).toBeLessThanOrEqual(1);

    expect(quizInfo.numQuestions).toStrictEqual(0);
    expect(quizInfo.questions).toStrictEqual([]);
    expect(quizInfo.duration).toStrictEqual(0);
  });

  test('Success: Successfully delete a question, 2 questions, delete both in reverse order ', () => {
    const questionId2 = (
      adminQuizCreateQuestion(
        user,
        quizId,
        'What dat pokemon',
        50,
        1,
        [
          { answer: 'Pukachi', correct: true },
          { answer: 'Han', correct: false },
          { answer: 'Charmander', correct: false },
        ]
      ).content as { questionId: number }
    ).questionId;

    const result = adminQuizDeleteQuestion(user, quizId, questionId2);

    const currentTime = getCurrentTimestamp();

    const result2 = adminQuizDeleteQuestion(user, quizId, questionId);

    expect(result).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    expect(result2).toStrictEqual({
      statusCode: 200,
      content: {}
    });

    const quizInfo = (adminQuizInfo(user, quizId).content as QuizObject);

    const timeLastEdited = quizInfo.timeLastEdited;
    expect(timeLastEdited - currentTime).toBeLessThanOrEqual(1);

    expect(quizInfo.numQuestions).toStrictEqual(0);
    expect(quizInfo.questions).toStrictEqual([]);
    expect(quizInfo.duration).toStrictEqual(0);
  });
});
