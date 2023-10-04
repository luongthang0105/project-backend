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

// This function updates the description of the relevant quiz.
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {}
} 

// Helper function to check if a string contains alphanumeric characters or spaces
function alphanumericAndSpaceCheck(str) {
  return /^[A-Za-z\s\d]*$/.test(str)
}

// Helper function to get the current timestamp
function getCurrentTimestamp () {
  return Date.now()
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
  return {}
}

// This function gets all of the relevant information about the current quiz.
function adminQuizInfo(authUserId, quizId) {
  return {
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  }
}

// This function updates the name of the relevant quiz.
function adminQuizNameUpdate(authUserId, quizId, name) {

  const data = getData()
  const userid = authUserId
  const quizid = quizId


  // Checks if authUserId is valid
  const validUserId = data.users.find(({ authUserId }) => authUserId === userid)

  // If authUserId is invalid it returns error
  if (!validUserId) {
    return { error: 'AuthUserId is not a valid user' }
  }

  // Checks if authUserId is valid
  const validQuizId = data.quizzes.find(( { quizId }) => quizId === quizid)

  // If authUserId is invalid it returns error
  if (!validQuizId) {
    return { error: 'Quiz ID does not refer to a valid quiz' }
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      if (quiz.quizAuthorId !== authUserId) {
        return { error: "Quiz ID does not refer to a quiz that this user owns" }
      }
    }
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

  for (const quiz of data.quizzes) {
    if (quiz.quizAuthorId === authUserId) {
      if (quiz.name === name) {
        return { error: "Name is already used by the current logged in user for another quiz" }
      }
    }
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId && quiz.authUserId === authUserId) {
      quiz.name = name
      console.log(quiz)
      break
    }
  }
  
  return {}
}

export { adminQuizCreate, adminQuizNameUpdate }