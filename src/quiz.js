import { getData } from "./dataStore"
// This function is responsible for providing a list of all the quizzes owned by the logged in user 

function adminQuizList(authUserId) {
  return {
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  }
}


// Helper function to check if a string contains alphanumeric characters or spaces
function alphanumericAndSpaceCheck(str) {
  return /^[A-Za-z\s\d]*$/.test(str)
}

// Helper function to get the current timestamp
function getCurrentTimestamp () {
  return Date.now()
}

// This function updates the description of the relevant quiz.
// this function is yet to be tested. fn testing has been done, but needs to be further modified. 
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
if (existingQuiz.quizId !== authUserId) {
  return { error: "Quiz ID does not refer to a quiz that this user owns" };
}

if (description.length > 100) {
  return { error: "Description is more than 100 characters in length" }
}
const timestamp = getCurrentTimestamp()
existingQuiz.description = description
existingQuiz.timeLastEdited = timestamp
  return {success : true}
} 

// This function is responsible for creating a new quiz for a logged in user, given basic details about a new quiz
function adminQuizCreate(authUserId, name, description) {
  // AuthUserId is not a valid user
  const currData = getData()
  const id = authUserId
  const validUserId = currData.users.find(({ authUserId }) => authUserId === id)
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
  //checking for authUserId validity
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
  return {}
}

export {adminQuizList, adminQuizDescriptionUpdate, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate}

