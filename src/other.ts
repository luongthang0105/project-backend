import { setData } from './dataStore';
import { QuizObject, Token, UserObject } from './types';

// This function resets the state of the application back to the start.
function clear() {
  setData({
    users: [] as UserObject[],
    quizzes: [] as QuizObject[],
    trash: [] as QuizObject[],
    sessions: [] as Token[],
    nextUserId: 0,
    nextQuizId: 0,
    nextQuestionId: 0,
    nextAnswerId: 0
  });
  return {};
}

export { clear };
