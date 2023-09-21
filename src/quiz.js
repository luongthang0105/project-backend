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
