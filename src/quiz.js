import { getData } from "./dataStore.js"

// This function is responsible for  

/**
 * Provides a list of all the quizzes owned by the logged in user
 *
 * @param {number} - The currently logged in user id
 * @returns {
 * {
 *   quizzes: Array<
 *     {
 *       quizId: number,
 *       quizAuthorId: number,
 *       name: string,
 *       timeCreated: number, 
 *       timeLastEdited: number, 
 *       description: string
 *     }
 *   >
 * }
 * } - An object with "quizzes" as the key and an array of quiz information objects as the value.
 */

function adminQuizList(authUserId) {
  // Retrieve data
  const data = getData()

  // Check if authUserId is valid by searching for it in the list of users
  const validId = data.users.find(user => user.authUserId === authUserId)

  // If authUserId is invalid, return an error object
  if (!validId) {
    return { error: "AuthUserId is not a valid user" }
  }

  // Initialize an empty array to store the user's owned quizzes
  let quizList = []

  // Filter quizzes owned by the authenticated user
  const ownedQuizzes = data.quizzes.filter((quiz) => quiz.quizAuthorId === authUserId);

  // Map the filtered quizzes to a simplified format, containing quizId and name
  quizList = ownedQuizzes.map((quiz) => ({
    quizId: quiz.quizId,
    name: quiz.name,
  }));

  // Return an object containing the user's quizzes
  return {quizzes: quizList}
}


// Helper function to check if a string contains alphanumeric characters or spaces
function alphanumericAndSpaceCheck(str) {
  return /^[A-Za-z\s\d]*$/.test(str)
}

// Helper function to get the current timestamp
function getCurrentTimestamp () {
  return Math.floor(Date.now() / 1000)
}

/**
 * Creates a new quiz for a logged-in user, given basic details about the new quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} name - The name of the new quiz.
 * @param {string} description - The description of the new quiz.
 * @returns {
 * {quizId: number} | { error: string }} 
 * - An object containing the new quiz id if the quiz is successfully created.
 *   If any validation errors occur, it returns an error object with a message.
*/

function adminQuizCreate(authUserId, name, description) {
  // Retrieve the current data
  const currData = getData()

  // Check if authUserId is valid by searching for it in the list of users
  const uid = authUserId
  const validUserId = currData.users.find(({ authUserId }) => authUserId === uid)

  // If authUserId is not valid, return an error object
  if (!validUserId) {
    return { error: "AuthUserId is not a valid user" }
  }
  
  // Check if the name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    return { error: "Name contains invalid characters" }
  }

  // Check if the name is less than 3 characters long
  if (name.length < 3) {
    return { error: "Name is less than 3 characters long" }
  }

  // Check if the name is more than 30 characters long
  if (name.length > 30) {
    return { error: "Name is more than 30 characters long" }
  }

  // Check if the name is already used by the current logged-in user for another quiz
  for (const quiz of currData.quizzes) {
    if (quiz.quizAuthorId === authUserId) {
      if (quiz.name === name) {
        return { error: "Name is already used by the current logged in user for another quiz" }
      }
    }
  }

  // Check if the description is more than 100 characters in length
  if (description.length > 100) {
    return { error: "Description is more than 100 characters in length" }
  }

  // Get the current timestamp
  const timestamp = getCurrentTimestamp()
  
  // Create a new quiz object
  const newQuiz = {
    quizId: currData.nextQuizId,
    quizAuthorId: authUserId,
    name: name,
    timeCreated: timestamp,
    timeLastEdited: timestamp,
    description: description
  }

  // Increment the nextQuizId and add the new quiz to the data
  currData.nextQuizId++
  currData.quizzes.push(newQuiz)
  
  // Return an object containing the quizId of the newly created quiz
  return { quizId: newQuiz.quizId }
}

/**
 * Updates the description of a quiz owned by the authenticated user.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz to be updated.
 * @param {string} description - The new description for the quiz.
 * @returns {{ error: string } | {}} 
 *    - An empty object if the description is successfully updated.
 *      If any validation errors occur, it returns an error object with a message.
 */
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  // Retrieve the current data
  const data = getData()
  const id = authUserId
  
  // Check if authUserId is valid by searching for it in the list of users
  const validUserId = data.users.find(({ authUserId }) => authUserId === id);

  // If authUserId is not valid, return an error object
  if (!validUserId) {
    return { error: "AuthUserID is not a valid user" }
  }
  
  // Find the quiz with the specified quizId and check if it exists
  const existingQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId)

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
    return { error: "Description is more than 100 characters in length" }
  }

  // Get the current timestamp
  const timestamp = getCurrentTimestamp()

  // Update the quiz's description and last edited timestamp
  existingQuiz.description = description
  existingQuiz.timeLastEdited = timestamp

  // Return an empty object to indicate a successful update
  return {}
} 

// This function is responsible for permanently removing a particular quiz.
function adminQuizRemove(authUserId, quizId) {
  // AuthUserId is not a valid user
  const currData = getData()
  const uid = authUserId
  const validUserId = currData.users.find(({ authUserId }) => authUserId === uid)
  if (!validUserId) {
    return { error: "AuthUserId is not a valid user" }
  }

  // Quiz ID does not refer to a valid quiz
  const qid = quizId
  const validQuizId = currData.quizzes.find(({ quizId }) => quizId === qid)
  if (!validQuizId) {
    return { error: "Quiz ID does not refer to a valid quiz" }
  }

  // Quiz ID does not refer to a quiz that this user owns
  for (const quiz of currData.quizzes) {
    if (quiz.quizId === quizId) {
      if (quiz.quizAuthorId !== authUserId) {
        return { error: "Quiz ID does not refer to a quiz that this user owns" }
      }
    }
  }
  
  for (let i = 0; i < currData.quizzes.length; i++) {
    if (currData.quizzes[i].quizId === quizId) {
      currData.quizzes.splice(i, 1);
    }
  }
  
  return { }
}

// This function gets all of the relevant information about the current quiz.
function adminQuizInfo(authUserId, quizId) {
  // checking for authUserId validity
  const data = getData()
  const userID = authUserId
  const validUserId = data.users.find(({ authUserId }) => authUserId === userID);

  if (!validUserId) {
    return { error: "AuthUserID is not a valid user" }
  }
  
  // finding the quizId and checking to see if it exists
 const existingQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId)


 //error message if it does not exist
 if (!existingQuiz) {
  return { error: "Quiz ID does not refer to a valid quiz" };
}
const timeCreated = existingQuiz.timeCreated
const timeLastEdited = existingQuiz.timeLastEdited


// error message if the quizId is not what the user owns
if (existingQuiz.quizAuthorId !== authUserId) {
  return { error: "Quiz ID does not refer to a quiz that this user owns" };
}

// show QuizInfo

  return {
    quizId: existingQuiz.quizId,
    name: existingQuiz.name,
    timeCreated: timeCreated,
    timeLastEdited: timeLastEdited, 
    description: existingQuiz.description,
  }
}

// This function updates the name of the relevant quiz.
function adminQuizNameUpdate(authUserId, quizId, name) {

  const data = getData()
  const userid = authUserId
  const quizid = quizId

  // Checks if authUserId is valid
  const validUser = data.users.find(({ authUserId }) => authUserId === userid)

  // If authUserId is invalid it returns error
  if (!validUser) {
    return { error: 'AuthUserId is not a valid user' }
  }

  // Checks if authUserId is valid
  const validQuiz = data.quizzes.find(( { quizId }) => quizId === quizid)

  // If authUserId is invalid it returns error
  if (!validQuiz) {
    return { error: 'Quiz ID does not refer to a valid quiz' }
  }

  if (validQuiz.quizAuthorId !== authUserId) {
    return { error: "Quiz ID does not refer to a quiz that this user owns" }
  }

  // Checks if name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    return { error: "Name contains invalid characters" }
  }

  // Checks if name is less than 3 characters
  if (name.length < 3) {
    return { error: 'Name is less than 3 characters long' }
  }

  // Checks if name is greater than 30 characters
  if (name.length > 30) {
    return { error: 'Name is greater than 30 characters long' }
  }

  // If the given name is the same as the current name of the quiz, we just need to update the timestamp
  if (validQuiz.name === name) {
    validQuiz.timeLastEdited = getCurrentTimestamp()
  } else {
    for (const quiz of data.quizzes) {
      if (quiz.quizAuthorId === authUserId) {
        if (quiz.name === name) {
          return { error: "Name is already used by the current logged in user for another quiz" }
        }
      }
    }
    validQuiz.name = name
    validQuiz.timeLastEdited = getCurrentTimestamp()
  }
  return {}
}

export { adminQuizCreate, adminQuizInfo, adminQuizRemove, adminQuizList, adminQuizNameUpdate, adminQuizDescriptionUpdate }
