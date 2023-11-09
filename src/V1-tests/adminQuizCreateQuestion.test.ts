import { getCurrentTimestamp } from '../quizHelper';
import {
  adminQuizCreate,
  adminAuthRegister,
  clear,
  adminQuizCreateQuestion,
  adminQuizInfo,
} from '../testWrappersV1';
import { Question, Quiz, QuizObject, ReturnedToken } from '../types';

import './toHaveValidColour';
import { expect, test } from '@jest/globals';

describe('adminQuizCreateQuestion', () => {
  let user: ReturnedToken;
  let quiz: Quiz;
  let questInfo: Question;
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
  });

  test.each([
    { question: 'Less' },
    { question: 'Les' },
    { question: 'Le' },
    { question: 'L' },
    { question: '' },
    { question: 'This is way longer than fifty characters please trust me' },
  ])(
    'Error: Question string is less than 5 characters in length or greater than 50 characters in length',
    ({ question }) => {
      questInfo.question = question;

      const result = adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      );

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            'Question string is less than 5 characters in length or greater than 50 characters in length',
        },
      });
    }
  );

  test.each([
    {
      answers: [
        { answer: 'Pikachu', correct: true },
        { answer: 'Thomas', correct: false },
        { answer: 'Charmander', correct: false },
        { answer: 'Charizard', correct: false },
        { answer: 'Raichu', correct: false },
        { answer: 'Squirtle', correct: false },
        { answer: 'Rattata', correct: false },
      ],
    },
    {
      answers: [{ answer: 'Pikachu', correct: true }],
    },
  ])('Error: The question has more than 6 answers', ({ answers }) => {
    questInfo.answers = answers;
    const result = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'The question has more than 6 answers or less than 2 answers',
      },
    });
  });

  test.each([{ duration: 0 }, { duration: -1 }, { duration: -3 }])(
    'Error: The question duration is not a positive number',
    ({ duration }) => {
      questInfo.duration = duration;

      const result = adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      );

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error: 'The question duration is not a positive number',
        },
      });
    }
  );

  test.each([
    { duration: 181, times: 1 },
    { duration: 91, times: 2 },
    { duration: 61, times: 3 },
    { duration: 70, times: 4 },
    { duration: 37, times: 5 },
  ])(
    'Error: The sum of the question durations in the quiz exceeds 3 minutes',
    ({ duration, times }) => {
      questInfo.duration = duration;

      for (let i = 0; i < times - 1; ++i) {
        adminQuizCreateQuestion(
          user,
          quiz.quizId,
          questInfo.question,
          questInfo.duration,
          questInfo.points,
          questInfo.answers
        );
      }

      const result = adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      );

      // Each question has a duration of 60s, so three of them added up to 180s = 3 mins
      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            'The sum of the question durations in the quiz exceeds 3 minutes',
        },
      });
    }
  );

  test.each([{ points: 11 }, { points: 12 }, { points: 0 }, { points: -1 }])(
    'Error: The points awarded for the question are less than 1 or greater than 10',
    ({ points }) => {
      questInfo.points = points;

      const result = adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      );

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            'The points awarded for the question are less than 1 or greater than 10',
        },
      });
    }
  );
  test.each([
    {
      answers: [
        { answer: 'Pikachu', correct: false },
        { answer: '', correct: true },
        { answer: 'Raichu', correct: false },
      ],
    },
    {
      answers: [
        { answer: 'Pukachi', correct: false },
        { answer: 'OMG', correct: false },
        { answer: 'this is way longer than 30 characters long', correct: true },
      ],
    },
  ])(
    'Error: The length of any answer is shorter than 1 character long, or longer than 30 characters long',
    ({ answers }) => {
      questInfo.answers = answers;

      const result = adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      );

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            'The length of any answer is shorter than 1 character long, or longer than 30 characters long',
        },
      });
    }
  );

  test.each([
    {
      answers: [
        { answer: 'Pikachu', correct: false },
        { answer: 'Pikachu', correct: true },
        { answer: 'Pikachu', correct: false },
      ],
    },
    {
      answers: [
        { answer: 'Thomas', correct: false },
        { answer: 'Han', correct: false },
        { answer: 'Thomas', correct: true },
      ],
    },
  ])(
    'Error: Any answer strings are duplicates of one another (within the same question)',
    ({ answers }) => {
      questInfo.answers = answers;

      const result = adminQuizCreateQuestion(
        user,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      );

      expect(result).toStrictEqual({
        statusCode: 400,
        content: {
          error:
            'Any answer strings are duplicates of one another (within the same question)',
        },
      });
    }
  );

  test.each([
    {
      answers: [
        { answer: 'Pikachu', correct: false },
        { answer: 'Pukachi', correct: false },
        { answer: 'Chikapu', correct: false },
      ],
    },
    {
      answers: [
        { answer: 'Thomas', correct: false },
        { answer: 'Han', correct: false },
      ],
    },
  ])('Error: There are no correct answers', ({ answers }) => {
    questInfo.answers = answers;

    const result = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    );

    expect(result).toStrictEqual({
      statusCode: 400,
      content: {
        error: 'There are no correct answers',
      },
    });
  });

  test.each([
    {
      invalidToken: {
        token: '-1',
      },
    },
    {
      invalidToken: {
        token: '',
      },
    },
  ])(
    'Error: Token is empty or invalid (does not refer to valid logged in user session)',
    ({ invalidToken }) => {
      const result = adminQuizCreateQuestion(
        invalidToken,
        quiz.quizId,
        questInfo.question,
        questInfo.duration,
        questInfo.points,
        questInfo.answers
      );

      expect(result).toStrictEqual({
        statusCode: 401,
        content: {
          error:
            'Token is empty or invalid (does not refer to valid logged in user session)',
        },
      });
    }
  );

  test('Error: Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = adminAuthRegister(
      'thangthongthai@gmai.com',
      '2705uwuwuwu',
      'Thomas',
      'Hanh'
    ).content as ReturnedToken;
    const result = adminQuizCreateQuestion(
      user2,
      quiz.quizId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    );

    expect(result).toStrictEqual({
      statusCode: 403,
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
    });
  });

  test('Success: Successfully create new question', () => {
    const result = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    );
    const currTimeStamp = getCurrentTimestamp();
    const result2 = adminQuizCreateQuestion(
      user,
      quiz.quizId,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    );

    expect(result).toStrictEqual({
      statusCode: 200,
      content: {
        questionId: expect.any(Number),
      },
    });

    expect(result2).toStrictEqual({
      statusCode: 200,
      content: {
        questionId: expect.any(Number),
      },
    });

    const quizInfo = adminQuizInfo(user, quiz.quizId);
    expect(quizInfo).toStrictEqual({
      statusCode: 200,
      content: {
        quizId: quiz.quizId,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description',
        numQuestions: 2,
        duration: 8,
        questions: [
          {
            questionId: (result.content as { questionId: number }).questionId,
            question: 'What is that pokemon',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Pikachu',
                correct: true,
                colour: expect.any(String),
                answerId: expect.any(Number)
              },
              {
                answer: 'Thomas',
                correct: false,
                colour: expect.any(String),
                answerId: expect.any(Number),
              }
            ],
          },
          {
            questionId: (result2.content as { questionId: number }).questionId,
            question: 'What is that pokemon',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Pikachu',
                correct: true,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number)
              },
              {
                answer: 'Thomas',
                correct: false,
                colour: expect.toHaveValidColour(),
                answerId: expect.any(Number)
              },
            ],
          },
        ],
      },
    });

    const timeLastEdited = (quizInfo.content as QuizObject).timeLastEdited;
    expect(timeLastEdited - currTimeStamp).toBeLessThanOrEqual(1);
  });

  test('QuizId does not exist', () => {
    const result = adminQuizCreateQuestion(
      user,
      quiz.quizId + 1,
      questInfo.question,
      questInfo.duration,
      questInfo.points,
      questInfo.answers
    );
    expect(result).toStrictEqual({
      statusCode: 403,
      content: { error: 'Valid token is provided, but user is not an owner of this quiz' }
    });
  });
});
