import { getData, getTimers, setData } from './dataStore';
import { Player, QuizObject, QuizSession, Token, UserObject } from './types';

// This function resets the state of the application back to the start.
function clear() {
  // clearing any pending timeouts so it doesnt affect the tests
  const timers = getTimers();
  timers.forEach(timer => clearTimeout(timer))

  setData({
    users: [] as UserObject[],
    quizzes: [] as QuizObject[],
    trash: [] as QuizObject[],
    sessions: [] as Token[],
    quizSessions: [] as QuizSession[],
    players: [] as Player[],
    nextUserId: 0,
    nextQuizId: 0,
    nextQuestionId: 0,
    nextAnswerId: 0,
    nextQuizSessionId: 0,
    nextPlayerId: 0
  });
  return {};
}

export { clear };
