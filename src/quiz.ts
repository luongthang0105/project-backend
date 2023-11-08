import request from 'sync-request-curl';
import { getData, setData } from './dataStore';
import {
  alphanumericAndSpaceCheck,
  getCurrentTimestamp,
  getQuestionColour,
  hasDuplicatedAnswers,
  moveQuestion,
} from './quizHelper';
import {
  Answer,
  EmptyObject,
  Question,
  Quiz,
  QuizList,
  QuizObject,
} from './types';
import HTTPError from 'http-errors';
/**
 * Provides a list of all the quizzes owned by the logged in user
 *
 * @param {number} authUserId - The currently logged in user id
 * @returns {QuizList | ErrorObject}
 * } - An object with "quizzes" as the key and an array of quiz information objects as the value.
 */
const adminQuizList = (token: string): QuizList => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
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
 * @returns {Quiz}
 * - An object containing the new quiz id if the quiz is successfully created.
 *   If any validation errors occur, it returns an error object with a message.
 */
const adminQuizCreate = (
  token: string,
  name: string,
  description: string
): Quiz => {
  // Retrieve the current data
  const currData = getData();

  const validSession = currData.sessions.find(
    (session) => session.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Check if the name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    throw HTTPError(400, 'Name contains invalid characters');
  }

  // Check if the name is less than 3 characters long
  if (name.length < 3) {
    throw HTTPError(400, 'Name is less than 3 characters long');
  }

  // Check if the name is more than 30 characters long
  if (name.length > 30) {
    throw HTTPError(400, 'Name is more than 30 characters long');
  }

  // Check if the name is already used by the current logged-in user for another quiz
  const quizNameUsed = currData.quizzes.find(
    (quiz: QuizObject) => quiz.quizAuthorId === authUserId && quiz.name === name
  );
  if (quizNameUsed) {
    throw HTTPError(
      400,
      'Name is already used by the current logged in user for another quiz'
    );
  }

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
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
    questions: [] as Question[],
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
): EmptyObject => {
  // Retrieve the current data
  const data = getData();

  const session = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !session) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = session.authUserId;

  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // Return an error message if the quiz with the given quizId does not exist
  if (!existingQuiz) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
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
const adminQuizRemove = (token: string, quizId: number): EmptyObject => {
  // Retrieve the current data
  const currData = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validSession = currData.sessions.find(
    (session) => session.identifier === token
  );

  // If authUserId is not valid, return an error object
  if (!validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const existingQuiz = currData.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  if (!existingQuiz) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
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
const adminQuizInfo = (token: string, quizId: number): QuizObject => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currToken) => currToken.identifier === token
  );

  if (!validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // Return an error message if the quiz with the given quizId does not exist
  if (!existingQuiz) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }
  const timeCreated = existingQuiz.timeCreated;
  const timeLastEdited = existingQuiz.timeLastEdited;

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
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
): EmptyObject => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  if (!validQuiz) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Check if the new name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    throw HTTPError(400, 'Name contains invalid characters');
  }

  // Checks if name is less than 3 characters
  if (name.length < 3) {
    throw HTTPError(400, 'Name is less than 3 characters long');
  }

  // Checks if name is greater than 30 characters
  if (name.length > 30) {
    throw HTTPError(400, 'Name is greater than 30 characters long');
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
      throw HTTPError(
        400,
        'Name is already used by the current logged in user for another quiz'
      );
    }

    // Update the quiz's name and timestamp
    validQuiz.name = name;
    validQuiz.timeLastEdited = getCurrentTimestamp();
  }

  setData(data);

  // Return an empty object to indicate a successful update
  return {};
};

/**
 * View the quizzes that are currently in the trash for the logged in user
 *
 * @param {string} token
 * @returns {QuizList}
 */
const adminQuizViewTrash = (token: string): QuizList => {
  // Retrieve the current data
  const currData = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
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

/**
 * Creates a new question within a quiz.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizId - The unique identifier of the quiz to which the question should be added.
 * @param question - The text of the question.
 * @param duration - The duration (in seconds) allocated for answering the question.
 * @param points - The number of points awarded for the question.
 * @param answers - An array of answer objects associated with the question.
 *
 * @returns Either the question's unique identifier (questionId) or an ErrorObject if any validation checks fail.
 */
const adminQuizCreateQuestion = (
  token: string,
  quizId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
): { questionId: number } => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Error: Token is empty or invalid (does not refer to valid logged in user session)
  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  // Error: Valid token is provided, but user is unauthorised to complete this action
  const authUserId = validSession.authUserId;
  const validQuiz = data.quizzes.find((currQuiz) => currQuiz.quizId === quizId);

  if (validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Error: Question string is less than 5 characters in length or greater than 50 characters in length
  if (question.length < 5 || question.length > 50) {
    throw HTTPError(
      400,
      'Question string is less than 5 characters in length or greater than 50 characters in length'
    );
  }

  // Error: The question has more than 6 answers or less than 2 answers
  if (answers.length < 2 || answers.length > 6) {
    throw HTTPError(
      400,
      'The question has more than 6 answers or less than 2 answers'
    );
  }

  // Error: The question duration is not a positive number
  if (duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  // Error: The sum of the question durations in the quiz exceeds 3 minutes === 180 secs
  const currTotalDuration = validQuiz.duration;
  if (currTotalDuration + duration > 180) {
    throw HTTPError(
      400,
      'The sum of the question durations in the quiz exceeds 3 minutes'
    );
  }

  // Error: The points awarded for the question are less than 1 or greater than 10
  if (points < 1 || points > 10) {
    throw HTTPError(
      400,
      'The points awarded for the question are less than 1 or greater than 10'
    );
  }

  // The length of any answer is shorter than 1 character long, or longer than 30 characters long
  const invalidLengthAnswers = answers.filter(
    ({ answer }) => answer.length < 1 || answer.length > 30
  );
  if (invalidLengthAnswers.length !== 0) {
    throw HTTPError(
      400,
      'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
    );
  }

  // Error: Any answer strings are duplicates of one another (within the same question)
  if (hasDuplicatedAnswers(answers)) {
    throw HTTPError(
      400,
      'Any answer strings are duplicates of one another (within the same question)'
    );
  }

  // There are no correct answers
  const correctAnswers = answers.filter(
    (currAnswer) => currAnswer.correct === true
  );
  if (correctAnswers.length === 0) {
    throw HTTPError(400, 'There are no correct answers');
  }

  // Make an array of answers that has the four properties. The colour attribute is randomly generated via getQuestionColour()
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

/**
 * Updates an existing question within a quiz.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizId - The unique identifier of the quiz containing the question.
 * @param questionId - The unique identifier of the question to be updated.
 * @param question - The updated text of the question.
 * @param duration - The updated duration (in seconds) for answering the question.
 * @param points - The updated number of points awarded for the question.
 * @param answers - An array of updated answer objects associated with the question.
 *
 * @returns An EmptyObject if the question is updated successfully or an ErrorObject if any validation checks fail.
 */
const adminQuizQuestionUpdate = (
  token: string,
  quizId: number,
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
): EmptyObject => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Error: Token is empty or invalid (does not refer to valid logged in user session)
  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  // Error: Valid token is provided, but user is unauthorised to complete this action
  const authUserId = validSession.authUserId;
  const validQuiz = data.quizzes.find((currQuiz) => currQuiz.quizId === quizId);

  if (validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Error: Question Id does not refer to a valid question within this quiz
  const validQuestion = validQuiz.questions.find(
    (currQuestion) => currQuestion.questionId === questionId
  );

  if (!validQuestion) {
    throw HTTPError(
      400,
      'Question Id does not refer to a valid question within this quiz'
    );
  }

  // Error: Question string is less than 5 characters in length or greater than 50 characters in length
  if (question.length < 5 || question.length > 50) {
    throw HTTPError(
      400,
      'Question string is less than 5 characters in length or greater than 50 characters in length'
    );
  }

  // Error: The question has more than 6 answers or less than 2 answers
  if (answers.length < 2 || answers.length > 6) {
    throw HTTPError(
      400,
      'The question has more than 6 answers or less than 2 answers'
    );
  }

  // Error: The question duration is not a positive number
  if (duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  // Error: The sum of the question durations (after updating this question) in the quiz exceeds 3 minutes === 180 secs
  const currTotalDuration = validQuiz.duration;
  const oldQuestionDuration = validQuestion.duration;
  if (currTotalDuration - oldQuestionDuration + duration > 180) {
    throw HTTPError(
      400,
      'The sum of the question durations in the quiz exceeds 3 minutes'
    );
  }

  // Error: The points awarded for the question are less than 1 or greater than 10
  if (points < 1 || points > 10) {
    throw HTTPError(
      400,
      'The points awarded for the question are less than 1 or greater than 10'
    );
  }

  // Error: The length of any answer is shorter than 1 character long, or longer than 30 characters long
  const invalidLengthAnswers = answers.filter(
    ({ answer }) => answer.length < 1 || answer.length > 30
  );
  if (invalidLengthAnswers.length !== 0) {
    throw HTTPError(
      400,
      'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
    );
  }

  // Error: Any answer strings are duplicates of one another (within the same question)
  if (hasDuplicatedAnswers(answers)) {
    throw HTTPError(
      400,
      'Any answer strings are duplicates of one another (within the same question)'
    );
  }

  // Error: There are no correct answers
  const correctAnswers = answers.filter(
    (currAnswer) => currAnswer.correct === true
  );
  if (correctAnswers.length === 0) {
    throw HTTPError(400, 'There are no correct answers');
  }

  const updatedAnswerList: Answer[] = answers.map((currAnswer) => {
    const newAnswerId = data.nextAnswerId;
    data.nextAnswerId += 1;
    return {
      answerId: newAnswerId,
      answer: currAnswer.answer,
      colour: getQuestionColour(),
      correct: currAnswer.correct,
    };
  });

  // update quiz duration by subtracting it by the old duration and adding the new duration
  validQuiz.duration = validQuiz.duration - oldQuestionDuration + duration;

  // update the info of this question
  validQuestion.answers = updatedAnswerList;
  validQuestion.duration = duration;
  validQuestion.points = points;
  validQuestion.question = question;

  // update the last edited timestamp
  validQuiz.timeLastEdited = getCurrentTimestamp();

  setData(data);

  return {};
};

/**
 * Deletes a question within a quiz.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizId - The unique identifier of the quiz containing the question.
 * @param questionId - The unique identifier of the question to be deleted.
 *
 * @returns An EmptyObject if the question is deleted successfully or an ErrorObject if any validation checks fail.
 */
const adminQuizDeleteQuestion = (
  token: string,
  quizId: number,
  questionId: number
): EmptyObject => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Check if question Id does not refer to a valid question within this quiz
  const validQuestion = validQuiz.questions.find(
    (currQuestion) => currQuestion.questionId === questionId
  );
  if (!validQuestion) {
    throw HTTPError(
      400,
      'Question Id does not refer to a valid question within this quiz'
    );
  }

  // Make an array of questionId (type number) only by using map, then find the index of the wanted question by indexOf
  // We need to map validQuiz.questions to another array of numbers because .indexOf only works for array of primitive values
  const indexOfDeletedQuestion = validQuiz.questions
    .map((currQuestion) => currQuestion.questionId)
    .indexOf(questionId);
  validQuiz.questions.splice(indexOfDeletedQuestion, 1);

  validQuiz.numQuestions -= 1;
  validQuiz.duration -= validQuestion.duration;

  setData(data);

  return {};
};

/**
 * Moves a question within a quiz to a new position.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizId - The unique identifier of the quiz containing the question.
 * @param questionId - The unique identifier of the question to be moved.
 * @param newPosition - The new position for the question within the quiz.
 *
 * @returns An EmptyObject if the question is moved successfully or an ErrorObject if any validation checks fail.
 */
const adminQuizMoveQuestion = (
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
): EmptyObject => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  // Check if the quiz with the given quizId is owned by the authenticated user
  if (!validQuiz || validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  const validQuestion = validQuiz.questions.find(
    (question: Question) => question.questionId === questionId
  );

  if (!validQuestion) {
    throw HTTPError(
      400,
      'Question Id does not refer to a valid question within this quiz'
    );
  }

  if (newPosition < 0 || newPosition > validQuiz.numQuestions - 1) {
    throw HTTPError(
      400,
      'NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions'
    );
  }

  const currPosition = validQuiz.questions.findIndex(
    (question: Question) => question.questionId === questionId
  );

  if (newPosition === currPosition) {
    throw HTTPError(400, 'NewPosition is the position of the current question');
  }

  moveQuestion(validQuiz.questions, currPosition, newPosition);

  validQuiz.timeLastEdited = getCurrentTimestamp();

  setData(data);

  return {};
};

/**
 * Restores a quiz from the trash.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizId - The unique identifier of the quiz to be restored from the trash.
 *
 * @returns An EmptyObject if the quiz is successfully restored or an ErrorObject if any validation checks fail.
 */
const adminQuizRestore = (token: string, quizId: number): EmptyObject => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const existingQuizinTrash = data.trash.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  if (!existingQuizinTrash) {
    throw HTTPError(
      400,
      'Quiz ID refers to a quiz that is not currently in the trash'
    );
  }

  const existingQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.name === existingQuizinTrash.name
  );

  if (existingQuiz) {
    throw HTTPError(
      400,
      'Quiz name of the restored quiz is already used by another active quiz'
    );
  }

  if (existingQuizinTrash.quizAuthorId !== validSession.authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }
  existingQuizinTrash.timeLastEdited = getCurrentTimestamp();

  data.quizzes.push(existingQuizinTrash);
  for (let i = 0; i < data.trash.length; i++) {
    if (data.trash[i].quizId === quizId) {
      data.trash.splice(i, 1);
    }
  }

  setData(data);
  return {};
};

/**
 * Duplicates a question within a quiz.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizId - The unique identifier of the quiz containing the question to be duplicated.
 * @param questionId - The unique identifier of the question to be duplicated.
 *
 * @returns An object with `newQuestionId` if the duplication is successful, or an ErrorObject if any validation checks fail.
 */
const adminQuizDuplicateQuestion = (
  token: string,
  quizId: number,
  questionId: number
): { newQuestionId: number } => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // If quizId is not valid, return an error object
  // Check if the quiz with the given quizId is owned by the authenticated user
  if (!validQuiz || validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  const validQuestion = validQuiz.questions.find(
    (question: Question) => question.questionId === questionId
  );

  if (!validQuestion) {
    throw HTTPError(
      400,
      'Question Id does not refer to a valid question within this quiz'
    );
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
  data.nextQuestionId++;
  setData(data);
  return { newQuestionId: duplicateQuestion.questionId };
};

/**
 * Empty the trash by permanently deleting quizzes with specified quizIds.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizIds - An array of unique identifiers for the quizzes to be permanently deleted from the trash.
 *
 * @returns An EmptyObject if the operation is successful, or an ErrorObject if any validation checks fail.
 */
const adminQuizTrashEmpty = (token: string, quizIds: number[]): EmptyObject => {
  const currData = getData();

  const validSession = currData.sessions.find(
    (session) => session.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Error :"Valid token is provided, but one or more of the Quiz IDs refers to a quiz that this current user does not own"
  const quizInTrashNotOwnedByUser = currData.trash.find(
    (quizInTrash) =>
      quizIds.includes(quizInTrash.quizId) &&
      quizInTrash.quizAuthorId !== authUserId
  );
  if (quizInTrashNotOwnedByUser) {
    throw HTTPError(
      403,
      'Valid token is provided, but one or more of the Quiz IDs refers to a quiz that this current user does not own'
    );
  }

  const isAnyQuizNotInTrash = quizIds.filter((quizId: number) =>
    currData.trash.find((quizInTrash) => quizInTrash.quizId === quizId)
  );

  if (isAnyQuizNotInTrash.length !== quizIds.length) {
    throw HTTPError(
      400,
      'One or more of the Quiz IDs is not currently in the trash'
    );
  }

  currData.trash = currData.trash.filter(
    (quiz) => !quizIds.includes(quiz.quizId)
  );

  setData(currData);

  return {};
};

/**
 * Transfer ownership of a quiz to a different user based on their email
 *
 * @param {number} quizId - ID of the quiz
 * @param {string} Token - Token of the quiz owner
 * @param {string} userEmail - The email of the targeted user
 * @returns
 */
const adminQuizTransfer = (
  quizId: number,
  token: string,
  userEmail: string
): EmptyObject => {
  const data = getData();

  // Find the logged in user
  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Find the quizObject of the quizId
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  if (validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Finds the user object of the targeted email
  const targetUser = data.users.find(
    (targetEmail) => targetEmail.email === userEmail
  );

  if (!targetUser) {
    throw HTTPError(400, 'userEmail is not a real user');
  }

  // Finds the user that owns this token
  const currentUser = data.users.find((curr) => curr.authUserId === authUserId);

  // If this user has the same email as the targeted email, then throw error
  if (currentUser.email === userEmail) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }

  // Filters an array of quizzes that this target user owns
  const quizzesFromTargetedUsers = data.quizzes.filter(
    (curr) => curr.quizAuthorId === targetUser.authUserId
  );

  // Finds a quiz owned by the target user that has the same name of the transferred quiz
  const quizSameName = quizzesFromTargetedUsers.find(
    (quiz) => quiz.name === validQuiz.name
  );

  if (quizSameName) {
    throw HTTPError(
      400,
      'Quiz ID refers to a quiz that has a name that is already used by the target user'
    );
  }

  // Check if all sessions had ended (not yet to be implemented until It3)

  validQuiz.quizAuthorId = targetUser.authUserId;

  setData(data);

  return {};
};

// ====================================================================
//  =====================ITERATION 3 - v2 Functions====================
// ====================================================================
/**
 * Creates a new question within a quiz.
 *
 * @param token - The authentication token for the user performing the action.
 * @param quizId - The unique identifier of the quiz to which the question should be added.
 * @param question - The text of the question.
 * @param duration - The duration (in seconds) allocated for answering the question.
 * @param points - The number of points awarded for the question.
 * @param answers - An array of answer objects associated with the question.
 * @param thumbnailUrl - An Url to the thumbnail picture of the question
 *
 * @returns Either the question's unique identifier (questionId) or an ErrorObject if any validation checks fail.
 */
const adminQuizCreateQuestionV2 = (
  token: string,
  quizId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[],
  thumbnailUrl: string
): { questionId: number } => {
  const data = getData();

  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Error: Token is empty or invalid (does not refer to valid logged in user session)
  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  // Error: Valid token is provided, but user is unauthorised to complete this action
  const authUserId = validSession.authUserId;
  const validQuiz = data.quizzes.find((currQuiz) => currQuiz.quizId === quizId);

  if (validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Error: Question string is less than 5 characters in length or greater than 50 characters in length
  if (question.length < 5 || question.length > 50) {
    throw HTTPError(
      400,
      'Question string is less than 5 characters in length or greater than 50 characters in length'
    );
  }

  // Error: The question has more than 6 answers or less than 2 answers
  if (answers.length < 2 || answers.length > 6) {
    throw HTTPError(
      400,
      'The question has more than 6 answers or less than 2 answers'
    );
  }

  // Error: The question duration is not a positive number
  if (duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  // Error: The sum of the question durations in the quiz exceeds 3 minutes === 180 secs
  const currTotalDuration = validQuiz.duration;
  if (currTotalDuration + duration > 180) {
    throw HTTPError(
      400,
      'The sum of the question durations in the quiz exceeds 3 minutes'
    );
  }

  // Error: The points awarded for the question are less than 1 or greater than 10
  if (points < 1 || points > 10) {
    throw HTTPError(
      400,
      'The points awarded for the question are less than 1 or greater than 10'
    );
  }

  // The length of any answer is shorter than 1 character long, or longer than 30 characters long
  const invalidLengthAnswers = answers.filter(
    ({ answer }) => answer.length < 1 || answer.length > 30
  );
  if (invalidLengthAnswers.length !== 0) {
    throw HTTPError(
      400,
      'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
    );
  }

  // Error: Any answer strings are duplicates of one another (within the same question)
  if (hasDuplicatedAnswers(answers)) {
    throw HTTPError(
      400,
      'Any answer strings are duplicates of one another (within the same question)'
    );
  }

  // Error: There are no correct answers
  const correctAnswers = answers.filter(
    (currAnswer) => currAnswer.correct === true
  );
  if (correctAnswers.length === 0) {
    throw HTTPError(400, 'There are no correct answers');
  }

  // Error: The thumbnailUrl is an empty string
  if (thumbnailUrl === '') {
    throw HTTPError(400, 'The thumbnailUrl is an empty string');
  }

  // Error: The thumbnailUrl does not return to a valid file
  let res;
  try {
    res = request('GET', thumbnailUrl);
  } catch (err) {
    throw HTTPError(400, 'The thumbnailUrl does not return to a valid file');
  }

  // Error: The thumbnailUrl, when fetched, is not a JPG or PNG file type
  const contentType = res.headers['content-type'];
  if (contentType !== 'image/jpeg' &&
      contentType !== 'image/png') {
    throw HTTPError(400, 'The thumbnailUrl, when fetched, is not a JPG or PNG file type');
  }

  // Make an array of answers that has the four properties. The colour attribute is randomly generated via getQuestionColour()
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
    thumbnailUrl: thumbnailUrl
  };

  data.nextQuestionId += 1;

  validQuiz.questions.push(newQuestion);
  validQuiz.duration += duration;
  validQuiz.numQuestions += 1;
  validQuiz.timeLastEdited = getCurrentTimestamp();

  setData(data);

  return { questionId: newQuestion.questionId };
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
const adminQuizInfoV2 = (token: string, quizId: number): QuizObject => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currToken) => currToken.identifier === token
  );

  if (!validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // Return an error message if the quiz with the given quizId does not exist
  if (!existingQuiz) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }
  const timeCreated = existingQuiz.timeCreated;
  const timeLastEdited = existingQuiz.timeLastEdited;

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
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
    thumbnailUrl: existingQuiz.thumbnailUrl
  };
};

/**
 * Creates a new quiz for a logged-in user, given basic details about the new quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} name - The name of the new quiz.
 * @param {string} description - The description of the new quiz.
 * @returns {Quiz}
 * - An object containing the new quiz id if the quiz is successfully created.
 *   If any validation errors occur, it returns an error object with a message.
 */
const adminQuizCreateV2 = (
  token: string,
  name: string,
  description: string
): Quiz => {
  // Retrieve the current data
  const currData = getData();

  const validSession = currData.sessions.find(
    (session) => session.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Check if the name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    throw HTTPError(400, 'Name contains invalid characters');
  }

  // Check if the name is less than 3 characters long
  if (name.length < 3) {
    throw HTTPError(400, 'Name is less than 3 characters long');
  }

  // Check if the name is more than 30 characters long
  if (name.length > 30) {
    throw HTTPError(400, 'Name is more than 30 characters long');
  }

  // Check if the name is already used by the current logged-in user for another quiz
  const quizNameUsed = currData.quizzes.find(
    (quiz: QuizObject) => quiz.quizAuthorId === authUserId && quiz.name === name
  );
  if (quizNameUsed) {
    throw HTTPError(
      400,
      'Name is already used by the current logged in user for another quiz'
    );
  }

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
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
    questions: [] as Question[],
    numQuestions: 0,
    duration: 0,
    thumbnailUrl: ''
  };

  // Increment the nextQuizId and add the new quiz to the data
  currData.nextQuizId++;
  currData.quizzes.push(newQuiz);

  setData(currData);
  // Return an object containing the quizId of the newly created quiz
  return { quizId: newQuiz.quizId };
};

export {
  adminQuizCreate,
  adminQuizCreateV2,
  adminQuizInfo,
  adminQuizInfoV2,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizCreateQuestion,
  adminQuizCreateQuestionV2,
  adminQuizDeleteQuestion,
  adminQuizMoveQuestion,
  adminQuizTransfer,
  adminQuizViewTrash,
  adminQuizDuplicateQuestion,
  adminQuizRestore,
  adminQuizQuestionUpdate,
  adminQuizTrashEmpty,
};
