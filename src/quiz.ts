import { getData, setData } from './dataStore';
import {
  alphanumericAndSpaceCheck,
  getCurrentTimestamp,
  getQuestionColour,
  moveQuestion,
} from './quizHelper';
import {
  Answer,
  EmptyObject,
  ErrorObject,
  Question,
  Quiz,
  QuizList,
  QuizObject,
} from './types';

/**
 * Provides a list of all the quizzes owned by the logged in user
 *
 * @param {number} authUserId - The currently logged in user id
 * @returns {QuizList | ErrorObject}
 * } - An object with "quizzes" as the key and an array of quiz information objects as the value.
 */
const adminQuizList = (token: string): QuizList | ErrorObject => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    return {
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
      statusCode: 401,
    };
  }

  const authUserId = validSession.authUserId;

  // Filter quizzes owned by the authenticated user
  const ownedQuizzes = data.quizzes.filter(
    (quiz: QuizObject) => quiz.quizAuthorId === authUserId
  );

  // Map the filtered quizzes to a simplified format, containing quizId and name
  const quizList: Quiz[] = ownedQuizzes.map((quiz: QuizObject) => ({
    quizId: quiz.quizId,
    name: quiz.name,
  }));

  // Return an object containing the user's quizzes
  return { quizzes: quizList };
};

/**
 * Creates a new quiz for a logged-in user, given basic details about the new quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} name - The name of the new quiz.
 * @param {string} description - The description of the new quiz.
 * @returns {
 * Quiz | ErrorObject}
 * - An object containing the new quiz id if the quiz is successfully created.
 *   If any validation errors occur, it returns an error object with a message.
 */
const adminQuizCreate = (
  token: string,
  name: string,
  description: string
): Quiz | ErrorObject => {
  // Retrieve the current data
  const currData = getData();

  const validSession = currData.sessions.find(
    (session) => session.identifier === token
  );

  if (token === '' || !validSession) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = validSession.authUserId;

  // Check if the name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    return { statusCode: 400, error: 'Name contains invalid characters' };
  }

  // Check if the name is less than 3 characters long
  if (name.length < 3) {
    return { statusCode: 400, error: 'Name is less than 3 characters long' };
  }

  // Check if the name is more than 30 characters long
  if (name.length > 30) {
    return { statusCode: 400, error: 'Name is more than 30 characters long' };
  }

  // Check if the name is already used by the current logged-in user for another quiz
  const quizNameUsed = currData.quizzes.find(
    (quiz: QuizObject) => quiz.quizAuthorId === authUserId && quiz.name === name
  );
  if (quizNameUsed) {
    return {
      statusCode: 400,
      error:
        'Name is already used by the current logged in user for another quiz',
    };
  }

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    return {
      statusCode: 400,
      error: 'Description is more than 100 characters in length',
    };
  }

  // Get the current timestamp
  const timestamp = getCurrentTimestamp();

  // Create a new quiz object
  const newQuiz = {
    quizId: currData.nextQuizId,
    quizAuthorId: authUserId,
    name: name,
    timeCreated: timestamp,
    timeLastEdited: timestamp,
    description: description,
    questions: [] as any,
    numQuestions: 0,
    duration: 0,
  };

  // Increment the nextQuizId and add the new quiz to the data
  currData.nextQuizId++;
  currData.quizzes.push(newQuiz);

  setData(currData);
  // Return an object containing the quizId of the newly created quiz
  return { quizId: newQuiz.quizId };
};

/**
 * Updates the description of a quiz owned by the authenticated user.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz to be updated.
 * @param {string} description - The new description for the quiz.
 * @returns { ErrorObject | EmptyObject}
 *    - An empty object if the description is successfully updated.
 *      If any validation errors occur, it returns an error object with a message.
 */
const adminQuizDescriptionUpdate = (
  token: string,
  quizId: number,
  description: string
): ErrorObject | EmptyObject => {
  // Retrieve the current data
  const data = getData();

  const session = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !session) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = session.authUserId;

  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // Return an error message if the quiz with the given quizId does not exist
  if (!existingQuiz) {
    return { statusCode: 400, error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    return {
      statusCode: 403,
      error: 'Valid token is provided, but user is not an owner of this quiz',
    };
  }

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    return {
      statusCode: 400,
      error: 'Description is more than 100 characters in length',
    };
  }

  // Get the current timestamp
  const timestamp = getCurrentTimestamp();

  // Update the quiz's description and last edited timestamp
  existingQuiz.description = description;
  existingQuiz.timeLastEdited = timestamp;

  setData(data);

  // Return an empty object to indicate a successful update
  return {};
};

/**
 * Permanently removes a particular quiz owned by the authenticated user.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz to be removed.
 * @returns { ErrorObject | EmptyObject}
 *   - An empty object if the quiz is successfully removed.
 *     If any validation errors occur, it returns an error object with a message.
 */
const adminQuizRemove = (
  token: string,
  quizId: number
): ErrorObject | EmptyObject => {
  // Retrieve the current data
  const currData = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validSession = currData.sessions.find(
    (session) => session.identifier === token
  );

  // If authUserId is not valid, return an error object
  if (!validSession) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const existingQuiz = currData.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  if (!existingQuiz) {
    return { statusCode: 400, error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    return {
      statusCode: 403,
      error: 'Valid token is provided, but user is not an owner of this quiz',
    };
  }

  currData.trash.push(existingQuiz);

  // Remove the quiz from the data
  for (let i = 0; i < currData.quizzes.length; i++) {
    if (currData.quizzes[i].quizId === quizId) {
      currData.quizzes.splice(i, 1);
    }
  }

  setData(currData);

  // Return an empty object to indicate a successful removal
  return {};
};

/**
 * Retrieves all relevant information about the current quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz for which information is requested.
 * @returns {QuizObject | ErrorObject}
 * - An object containing information about the quiz if it exists and is owned
 *   by the authenticated user.
 *   If any validation errors occur, it returns an error object with a message.
 */
const adminQuizInfo = (
  token: string,
  quizId: number
): QuizObject | ErrorObject => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currToken) => currToken.identifier === token
  );

  if (!validSession) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = validSession.authUserId;

  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // Return an error message if the quiz with the given quizId does not exist
  if (!existingQuiz) {
    return { statusCode: 400, error: 'Quiz ID does not refer to a valid quiz' };
  }
  const timeCreated = existingQuiz.timeCreated;
  const timeLastEdited = existingQuiz.timeLastEdited;

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    return {
      statusCode: 403,
      error: 'Valid token is provided, but user is not an owner of this quiz',
    };
  }

  // Return object with relevant information about the quiz
  return {
    quizId: existingQuiz.quizId,
    name: existingQuiz.name,
    timeCreated: timeCreated,
    timeLastEdited: timeLastEdited,
    description: existingQuiz.description,
    questions: existingQuiz.questions,
    numQuestions: existingQuiz.numQuestions,
    duration: existingQuiz.duration,
  };
};

/**
 * Updates the name of the relevant quiz owned by the authenticated user.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz to be updated.
 * @param {string} name - The new name for the quiz.
 * @returns {ErrorObject | EmptyObject}
 *   - An empty object if the quiz name is successfully updated.
 *     If any validation errors occur, it returns an error object with a message.
 */
const adminQuizNameUpdate = (
  token: string,
  quizId: number,
  name: string
): ErrorObject | EmptyObject => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  if (!validQuiz) {
    return { statusCode: 400, error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (validQuiz.quizAuthorId !== authUserId) {
    return {
      statusCode: 403,
      error: 'Valid token is provided, but user is not an owner of this quiz',
    };
  }

  // Check if the new name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    return { statusCode: 400, error: 'Name contains invalid characters' };
  }

  // Checks if name is less than 3 characters
  if (name.length < 3) {
    return { statusCode: 400, error: 'Name is less than 3 characters long' };
  }

  // Checks if name is greater than 30 characters
  if (name.length > 30) {
    return {
      statusCode: 400,
      error: 'Name is greater than 30 characters long',
    };
  }

  // If the given name is the same as the current name of the quiz, update the last edited timestamp
  if (validQuiz.name === name) {
    validQuiz.timeLastEdited = getCurrentTimestamp();
  } else {
    // Check if the new name is already used by the user for another quiz
    const quizNameUsed = data.quizzes.find(
      (quiz: QuizObject) =>
        quiz.quizAuthorId === authUserId && quiz.name === name
    );

    if (quizNameUsed) {
      return {
        statusCode: 400,
        error:
          'Name is already used by the current logged in user for another quiz',
      };
    }

    // Update the quiz's name and timestamp
    validQuiz.name = name;
    validQuiz.timeLastEdited = getCurrentTimestamp();
  }

  setData(data);

  // Return an empty object to indicate a successful update
  return {};
};

const adminQuizViewTrash = (token: string): ErrorObject | QuizList => {
  // Retrieve the current data
  const currData = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    return {
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
      statusCode: 401,
    };
  }

  // Filter quizzes owned by the authenticated user
  const ownedQuizzes = currData.trash.filter(
    (quiz: QuizObject) => quiz.quizAuthorId === validSession.authUserId
  );

  // Map the filtered quizzes to a simplified format, containing quizId and name
  const quizList: Quiz[] = ownedQuizzes.map((quiz: QuizObject) => ({
    quizId: quiz.quizId,
    name: quiz.name,
  }));
  return { quizzes: quizList };
};

const adminQuizCreateQuestion = (
  token: string,
  quizId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
): { questionId: number } | ErrorObject => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = validSession.authUserId;

  const validQuiz = data.quizzes.find((currQuiz) => currQuiz.quizId === quizId);

  if (validQuiz.quizAuthorId !== authUserId) {
    return {
      statusCode: 403,
      error: 'Valid token is provided, but user is not an owner of this quiz',
    };
  }

  // Question string is less than 5 characters in length or greater than 50 characters in length
  if (question.length < 5 || question.length > 50) {
    return {
      statusCode: 400,
      error:
        'Question string is less than 5 characters in length or greater than 50 characters in length',
    };
  }

  // The question has more than 6 answers or less than 2 answers
  if (answers.length < 2 || answers.length > 6) {
    return {
      statusCode: 400,
      error: 'The question has more than 6 answers or less than 2 answers',
    };
  }

  // The question duration is not a positive number
  if (duration <= 0) {
    return {
      statusCode: 400,
      error: 'The question duration is not a positive number',
    };
  }

  // The sum of the question durations in the quiz exceeds 3 minutes === 180 secs
  const currDuration = validQuiz.duration;
  if (currDuration + duration > 180) {
    return {
      statusCode: 400,
      error: 'The sum of the question durations in the quiz exceeds 3 minutes',
    };
  }

  // The points awarded for the question are less than 1 or greater than 10
  if (points < 1 || points > 10) {
    return {
      statusCode: 400,
      error:
        'The points awarded for the question are less than 1 or greater than 10',
    };
  }

  // The length of any answer is shorter than 1 character long, or longer than 30 characters long
  const invalidLengthAnswers = answers.filter(
    ({ answer }) => answer.length < 1 || answer.length > 30
  );
  if (invalidLengthAnswers.length !== 0) {
    return {
      statusCode: 400,
      error:
        'The length of any answer is shorter than 1 character long, or longer than 30 characters long',
    };
  }

  // Any answer strings are duplicates of one another (within the same question)

  const duplicateAnswers = (): Answer[] => {
    // We iterate through each answer object by calling .filter()
    return answers.filter((currAnswer, currAnswerIndex) =>
      // If we can find another answer object that has different index but same "answer" string,
      // then add that object to the result array
      answers.find(
        (otherAnswer, otherAnswerIndex) =>
          otherAnswer.answer === currAnswer.answer &&
          otherAnswerIndex !== currAnswerIndex
      )
    );
  };

  if (duplicateAnswers().length !== 0) {
    return {
      statusCode: 400,
      error:
        'Any answer strings are duplicates of one another (within the same question)',
    };
  }

  // There are no correct answers
  const correctAnswers = answers.filter(
    (currAnswer) => currAnswer.correct === true
  );
  if (correctAnswers.length === 0) {
    return {
      statusCode: 400,
      error: 'There are no correct answers',
    };
  }

  const newAnswerList: Answer[] = answers.map((currAnswer) => {
    const newAnswerId = data.nextAnswerId;
    data.nextAnswerId += 1;
    return {
      answerId: newAnswerId,
      answer: currAnswer.answer,
      colour: getQuestionColour(),
      correct: currAnswer.correct,
    };
  });
  const newQuestion: Question = {
    questionId: data.nextQuestionId,
    question: question,
    duration: duration,
    points: points,
    answers: newAnswerList,
  };

  data.nextQuestionId += 1;

  validQuiz.questions.push(newQuestion);

  validQuiz.duration += duration;

  validQuiz.numQuestions += 1;

  validQuiz.timeLastEdited = getCurrentTimestamp();

  setData(data);

  return { questionId: newQuestion.questionId };
};

const adminQuizMoveQuestion = (
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
) => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  if (!validQuiz) {
    return { statusCode: 400, error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (validQuiz.quizAuthorId !== authUserId) {
    return {
      statusCode: 403,
      error: 'Valid token is provided, but user is not an owner of this quiz',
    };
  }

  const validQuestion = validQuiz.questions.find(
    (question: Question) => question.questionId === questionId
  );

  if (!validQuestion) {
    return {
      statusCode: 400,
      error: 'Question Id does not refer to a valid question within this quiz',
    };
  }

  if (newPosition < 0 || newPosition > validQuiz.numQuestions - 1) {
    return {
      statusCode: 400,
      error:
        'NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions',
    };
  }

  const currPosition = validQuiz.questions.findIndex(
    (question: Question) => question.questionId === questionId
  );

  if (newPosition === currPosition) {
    return {
      statusCode: 400,
      error: 'NewPosition is the position of the current question',
    };
  }

  moveQuestion(validQuiz.questions, currPosition, newPosition);

  validQuiz.timeLastEdited = getCurrentTimestamp();

  setData(data);

  return {};
};
const adminQuizDuplicateQuestion = (
  token: string,
  quizId: number,
  questionId: number
): { newQuestionId: number } | ErrorObject => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    return {
      statusCode: 401,
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  // Check if the quiz with the given quizId is owned by the authenticated user
  if (!validQuiz || validQuiz.quizAuthorId !== authUserId) {
    return {
      statusCode: 403,
      error: 'Valid token is provided, but user is not an owner of this quiz',
    };
  }

  const validQuestion = validQuiz.questions.find(
    (question: Question) => question.questionId === questionId
  );

  if (!validQuestion) {
    return {
      statusCode: 400,
      error: 'Question Id does not refer to a valid question within this quiz',
    };
  }

  const currPosition = validQuiz.questions.findIndex(
    (question: Question) => question.questionId === questionId
  );

  const duplicateQuestion = {
    questionId: data.nextQuestionId,
    question: validQuestion.question,
    duration: validQuestion.duration,
    points: validQuestion.points,
    answers: validQuestion.answers,
  };
  validQuiz.questions.splice(currPosition + 1, 0, duplicateQuestion);
  validQuiz.timeLastEdited = getCurrentTimestamp();
  validQuiz.numQuestions++;
  validQuiz.duration += duplicateQuestion.duration;
  setData(data);
  return { newQuestionId: duplicateQuestion.questionId };
};
export {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizMoveQuestion,
  adminQuizCreateQuestion,
  adminQuizViewTrash,
  adminQuizDuplicateQuestion,
};
