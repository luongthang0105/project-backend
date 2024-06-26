import {
  adminAuthRegister,
  clear,
} from '../testWrappersV1';
import {
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizCreate,
} from '../testWrappersV2';
import { Quiz, QuizObject, ReturnedToken } from '../types';

describe('adminQuizDescriptionUpdate', () => {
  let user: ReturnedToken;
  let quiz: Quiz;
  const invalidToken = {
    token: '-1',
  };
  beforeEach(() => {
    clear();
    user = adminAuthRegister(
      'han@gmai.com',
      '2705uwuwuwu',
      'Han',
      'Hanh'
    ).content as ReturnedToken;
    quiz = adminQuizCreate(user, 'New Quiz', 'description').content as Quiz;
  });
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const result = adminQuizDescriptionUpdate(
      invalidToken,
      quiz.quizId,
      'New description'
    );
    expect(result).toStrictEqual({
      content: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
      },
      statusCode: 401,
    });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const result3 = adminQuizDescriptionUpdate(
      user,
      quiz.quizId + 1,
      'Description'
    );
    expect(result3).toStrictEqual({
      content: { error: 'Valid token is provided, but user is not an owner of this quiz' },
      statusCode: 403,
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = adminAuthRegister(
      'thang@gmail.com',
      '0105uwuwuw',
      'Thomas',
      'Nguyen'
    ).content as ReturnedToken;
    const quiz2 = adminQuizCreate(
      user2,
      'New Quiz 2',
      'long description'
    ).content as Quiz;

    const result2 = adminQuizDescriptionUpdate(
      user,
      quiz2.quizId,
      'Description'
    );
    expect(result2).toStrictEqual({
      content: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
      },
      statusCode: 403,
    });
  });

  test('Description is more than 100 characters in length', () => {
    const oldDescription = (adminQuizInfo(user, quiz.quizId).content as QuizObject).description;
    // 105 characters
    const newDescription =
      'okidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidokiokidoki.';

    const result = adminQuizDescriptionUpdate(
      user,
      quiz.quizId,
      newDescription
    );
    expect(result).toEqual({
      content: { error: 'Description is more than 100 characters in length' },
      statusCode: 400,
    });

    const quizInfo = adminQuizInfo(user, quiz.quizId);
    expect((quizInfo.content as QuizObject).description).toStrictEqual(oldDescription);
  });

  test('Success case: check different timestamps', () => {
    expect(
      adminQuizDescriptionUpdate(user, quiz.quizId, 'New description')
    ).toStrictEqual({ content: {}, statusCode: 200 });

    const quizInfo = adminQuizInfo(user, quiz.quizId).content as QuizObject;
    expect(quizInfo.description).toStrictEqual('New description');
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(
      quizInfo.timeLastEdited
    );
  });
  test('Success case: Empty Description', () => {
    expect(adminQuizDescriptionUpdate(user, quiz.quizId, '')).toStrictEqual({
      content: {},
      statusCode: 200,
    });

    const quizInfo = adminQuizInfo(user, quiz.quizId);
    expect(quizInfo.statusCode).toStrictEqual(200);
    expect((quizInfo.content as QuizObject).description).toStrictEqual('');
    expect((quizInfo.content as QuizObject).timeCreated).toBeLessThanOrEqual(
      (quizInfo.content as QuizObject).timeLastEdited
    );
  });
});
