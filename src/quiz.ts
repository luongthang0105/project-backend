import { getData } from "./dataStore.js";
import { alphanumericAndSpaceCheck, getCurrentTimestamp } from "./quizHelper";
import {
  EmptyObject,
  ErrorObject,
  Quiz,
  QuizList,
  QuizObject,
} from "./types.js";

/**
 * Provides a list of all the quizzes owned by the logged in user
 *
 * @param {number} authUserId - The currently logged in user id
 * @returns {QuizList | ErrorObject}
 * } - An object with "quizzes" as the key and an array of quiz information objects as the value.
 */
const adminQuizList = (authUserId: number): QuizList | ErrorObject => {
  // Retrieve the current data
  const data = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validId = data.users.find((user) => user.authUserId === authUserId);

  // If authUserId is invalid, return an error object
  if (!validId) {
    return { error: "AuthUserId is not a valid user" };
  }

  // Initialize an empty array to store the user's owned quizzes
  let quizList = [];

  // Filter quizzes owned by the authenticated user
  const ownedQuizzes = data.quizzes.filter(
    (quiz) => quiz.quizAuthorId === authUserId
  );

  // Map the filtered quizzes to a simplified format, containing quizId and name
  quizList = ownedQuizzes.map((quiz) => ({
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
  authUserId: number,
  name: string,
  description: string
): Quiz | ErrorObject => {
  // Retrieve the current data
  const currData = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validUser = currData.users.find(
    (user) => user.authUserId === authUserId
  );

  // If authUserId is not valid, return an error object
  if (!validUser) {
    return { error: "AuthUserId is not a valid user" };
  }

  // Check if the name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    return { error: "Name contains invalid characters" };
  }

  // Check if the name is less than 3 characters long
  if (name.length < 3) {
    return { error: "Name is less than 3 characters long" };
  }

  // Check if the name is more than 30 characters long
  if (name.length > 30) {
    return { error: "Name is more than 30 characters long" };
  }

  // Check if the name is already used by the current logged-in user for another quiz
  let quizNameUsed = currData.quizzes.find(
    (quiz) => quiz.quizAuthorId === authUserId && quiz.name === name
  );
  if (quizNameUsed)
    return {
      error:
        "Name is already used by the current logged in user for another quiz",
    };

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    return { error: "Description is more than 100 characters in length" };
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
  };

  // Increment the nextQuizId and add the new quiz to the data
  currData.nextQuizId++;
  currData.quizzes.push(newQuiz);

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
  authUserId: number,
  quizId: number,
  description: string
): ErrorObject | EmptyObject => {
  // Retrieve the current data
  const data = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validUser = data.users.find((user) => user.authUserId === authUserId);

  // If authUserId is not valid, return an error object
  if (!validUser) {
    return { error: "AuthUserID is not a valid user" };
  }

  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Return an error message if the quiz with the given quizId does not exist
  if (!existingQuiz) {
    return { error: "Quiz ID does not refer to a valid quiz" };
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    return { error: "Quiz ID does not refer to a quiz that this user owns" };
  }

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    return { error: "Description is more than 100 characters in length" };
  }

  // Get the current timestamp
  const timestamp = getCurrentTimestamp();

  // Update the quiz's description and last edited timestamp
  existingQuiz.description = description;
  existingQuiz.timeLastEdited = timestamp;

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
  authUserId: number,
  quizId: number
): ErrorObject | EmptyObject => {
  // Retrieve the current data
  const currData = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validUser = currData.users.find(
    (user) => user.authUserId === authUserId
  );

  // If authUserId is not valid, return an error object
  if (!validUser) {
    return { error: "AuthUserId is not a valid user" };
  }

  // Check if quizId is valid by searching for it in the list of quizzes
  const existingQuiz = currData.quizzes.find((quiz) => quiz.quizId === quizId);

  // If quizId is not valid, return an error object
  if (!existingQuiz) {
    return { error: "Quiz ID does not refer to a valid quiz" };
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId)
    return {
      error: "Quiz ID does not refer to a quiz that this user owns",
    };

  // Remove the quiz from the data
  for (let i = 0; i < currData.quizzes.length; i++) {
    if (currData.quizzes[i].quizId === quizId) {
      currData.quizzes.splice(i, 1);
    }
  }

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
// DONT FORGET TO UPDATE THE RETURNED TYPE TO QuizObject AFTER FINISHED EDITING THIS FUNCTION
const adminQuizInfo = (
  authUserId: number,
  quizId: number
):
  | {
      quizId: number;
      name: string;
      description: string;
      timeCreated: number;
      timeLastEdited: number;
    }
  | ErrorObject => {
  // Retrieve the current data
  const data = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validUser = data.users.find((user) => user.authUserId === authUserId);

  // If authUserId is not valid, return an error object
  if (!validUser) {
    return { error: "AuthUserID is not a valid user" };
  }

  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // Return an error message if the quiz with the given quizId does not exist
  if (!existingQuiz) {
    return { error: "Quiz ID does not refer to a valid quiz" };
  }
  const timeCreated = existingQuiz.timeCreated;
  const timeLastEdited = existingQuiz.timeLastEdited;

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (existingQuiz.quizAuthorId !== authUserId) {
    return { error: "Quiz ID does not refer to a quiz that this user owns" };
  }

  // Return object with relevant information about the quiz
  // There is still an error here for type check because we haven't updated our function to the It2 spec yet (which needs to return questions, numQuestions, and duration also).
  return {
    quizId: existingQuiz.quizId,
    name: existingQuiz.name,
    timeCreated: timeCreated,
    timeLastEdited: timeLastEdited,
    description: existingQuiz.description,
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
  authUserId: number,
  quizId: number,
  name: string
): ErrorObject | EmptyObject => {
  // Retrieve the current data
  const data = getData();

  // Check if authUserId is valid by searching for it in the list of users
  const validUser = data.users.find((user) => user.authUserId === authUserId);

  // If authUserId is not valid, return an error object
  if (!validUser) {
    return { error: "AuthUserId is not a valid user" };
  }

  // Check if quizId is valid by searching for it in the list of quizzes
  const validQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  // If quizId is not valid, return an error object
  if (!validQuiz) {
    return { error: "Quiz ID does not refer to a valid quiz" };
  }

  // Check if the quiz with the given quizId is owned by the authenticated user
  if (validQuiz.quizAuthorId !== authUserId) {
    return { error: "Quiz ID does not refer to a quiz that this user owns" };
  }

  // Check if the new name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    return { error: "Name contains invalid characters" };
  }

  // Checks if name is less than 3 characters
  if (name.length < 3) {
    return { error: "Name is less than 3 characters long" };
  }

  // Checks if name is greater than 30 characters
  if (name.length > 30) {
    return { error: "Name is greater than 30 characters long" };
  }

  // If the given name is the same as the current name of the quiz, update the last edited timestamp
  if (validQuiz.name === name) {
    validQuiz.timeLastEdited = getCurrentTimestamp();
  } else {
    // Check if the new name is already used by the user for another quiz
    let quizNameUsed = data.quizzes.find(
      (quiz) => quiz.quizAuthorId === authUserId && quiz.name === name
    );

    if (quizNameUsed)
      return {
        error:
          "Name is already used by the current logged in user for another quiz",
      };

    // Update the quiz's name and timestamp
    validQuiz.name = name;
    validQuiz.timeLastEdited = getCurrentTimestamp();
  }
  // Return an empty object to indicate a successful update
  return {};
};

export {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
};
