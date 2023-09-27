import { setData } from "./dataStore"  

// This function resets the state of the application back to the start.
function clear() {
  setData({
    users: [],
    quizzes: [],
    nextUserId: 0
  })
  return {}
}

