import { AdminAction, DataStore, QuizSession, SessionState } from "./types";

/**
 * Auomatiacally transfer session states after fix amount of time
 *
 * @param newEmail - The email address to check.
 * @param data - The data store containing user information.
 *
 * @returns `true` if the email address is already in use, `false` otherwise.
 */
const autoChangeState = async (session: QuizSession, state: SessionState, duration: number): Promise<{}> => {
  if (state === 'QUESTION_COUNTDOWN') {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } else {
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));
  }
  if (session.state === state) {
    if (state === 'QUESTION_COUNTDOWN') {
      session.state = 'QUESTION_OPEN';
    } else {
      session.state = 'QUESTION_CLOSE';
    }
  }
  return {};
};

export {autoChangeState}