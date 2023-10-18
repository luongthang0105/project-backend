import { setData } from "./dataStore"  

// This function resets the state of the application back to the start.
function clear() {
  setData({
    users: [],
    quizzes: [],
    trash: [],
    nextUserId: 0,
    nextQuizId: 0
  })
  return {}
}

export { clear }

