import { getData } from "./dataStore"
import { getCurrentTimestamp, alphanumericAndSpaceCheck } from "./quizHelper.js"
// This function is responsible for providing a list of all the quizzes owned by the logged in user 

function adminQuizList(authUserId) {
  const data = getData()

  // Checks if authUserId is valid
  const validId = data.users.find(user => user.authUserId === authUserId)

  // If authUserId is invalid it returns error
  if (!validId) {
    return { error: "AuthUserId is not a valid user" }
  }

  let quizList = []

  const ownedQuizzes = data.quizzes.filter((quiz) => quiz.quizAuthorId === authUserId);
  quizList = ownedQuizzes.map((quiz) => ({
    quizId: quiz.quizId,
    name: quiz.name,
  }));

  return {quizzes: quizList}
}

// This function is responsible for creating a new quiz for a logged in user, given basic details about a new quiz
function adminQuizCreate(authUserId, name, description) {
  // AuthUserId is not a valid user
  const currData = getData()
  const uid = authUserId
  const validUserId = currData.users.find(({ authUserId }) => authUserId === uid)
  if (!validUserId) {
    return { error: "AuthUserId is not a valid user" }
  }
  
  // Name contains invalid characters
  if (!alphanumericAndSpaceCheck(name)) {
    return { error: "Name contains invalid characters" }
  }

  // Name is less than 3 characters long
  if (name.length < 3) {
    return { error: "Name is less than 3 characters long" }
  }

  // Name is more than 30 characters long
  if (name.length > 30) {
    return { error: "Name is more than 30 characters long" }
  }

  // Name is already used by the current logged in user for another quiz
  for (const quiz of currData.quizzes) {
    if (quiz.quizAuthorId === authUserId) {
      if (quiz.name === name) {
        return { error: "Name is already used by the current logged in user for another quiz" }
      }
    }
  }

  // Description is more than 100 characters in length
  if (description.length > 100) {
    return { error: "Description is more than 100 characters in length" }
  }
  const timestamp = getCurrentTimestamp()
  
  const newQuiz = {
    quizId: currData.nextQuizId,
    quizAuthorId: authUserId,
    name: name,
    timeCreated: timestamp,
    timeLastEdited: timestamp,
    description: description
  }
  currData.nextQuizId++
  currData.quizzes.push(newQuiz)
  
  return { quizId: newQuiz.quizId }
}

function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  const data = getData()
  const id = authUserId
  const validUserId = data.users.find(({ authUserId }) => authUserId === id);

  if (!validUserId) {
    return { error: "AuthUserID is not a valid user" }
  }
  
  // finding the quizId and checking to see if it exists
 const existingQuiz = data.quizzes.find((quiz) => quiz.quizId === quizId)

 //error message if it does not exist
 if (!existingQuiz) {
  return { error: "Quiz ID does not refer to a valid quiz" };
}

// error message if the quizId is not what the user owns
if (existingQuiz.quizAuthorId !== authUserId) {
  return { error: "Quiz ID does not refer to a quiz that this user owns" };
}

if (description.length > 100) {
  return { error: "Description is more than 100 characters in length" }
}
const timestamp = getCurrentTimestamp()
existingQuiz.description = description
existingQuiz.timeLastEdited = timestamp

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
