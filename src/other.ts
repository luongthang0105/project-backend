import { setData } from './dataStore';

// This function resets the state of the application back to the start.
function clear() {
  setData({
    users: [] as any,
    quizzes: [] as any,
    trash: [] as any,
    sessions: [] as any,
    nextTokenId: 0,
    nextUserId: 0,
    nextQuizId: 0,
    nextQuestionId: 0,
    nextAnswerId: 0
  });
  return {};
}

export { clear };
