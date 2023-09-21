// This function is responsible for providing a list of all the quizzes owned by the logged in user 

function adminQuizList (authUserId) {
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
  return {}
}