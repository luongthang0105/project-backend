import { getData, getTimers, setData } from './dataStore';
import { getCurrentTimestamp } from './quizHelper';
import { AdminAction, DataStore, Question, QuizSession } from './types';
import HTTPError from 'http-errors';
// /**
//  * Auomatiacally transfer session states after fix amount of time
//  *
//  * @param newEmail - The email address to check.
//  * @param data - The data store containing user information.
//  *
//  * @returns `true` if the email address is already in use, `false` otherwise.
//  */
// const autoChangeState = async (session: QuizSession, state: SessionState, duration): Promise<{}> => {
//   if (state === 'QUESTION_COUNTDOWN') {
//     await new Promise((resolve) => setTimeout(resolve, 3000));
//   } else {
//     await new Promise((resolve) => setTimeout(resolve, duration * 1000));
//   }
//   if (session.state === state) {
//     if (state === 'QUESTION_COUNTDOWN') {
//       session.state = 'QUESTION_OPEN';
//     } else {
//       session.state = 'QUESTION_CLOSE';
//     }
//   }
//   return {};
// };

/**
 * Change session state to QUESTION_OPEN state, calls a timeout for changing to QUESTION_CLOSE state
 *
 * @param quizSession - The current quiz session
 */
export const toQuestionOpenState = (quizSession: QuizSession, data: DataStore) => {
  quizSession.state = 'QUESTION_OPEN';
  quizSession.timeQuestionOpened = getCurrentTimestamp();
  setData(data);

  const questionPosition = quizSession.atQuestion - 1;
  const duration = quizSession.metadata.questions[questionPosition].duration;

  const timers = getTimers();
  timers.push(setTimeout(() => {
    // In during "duration" seconds, quizSession might get some new answers.
    // We need to get that new state of quizSession. If not, we will be overwriting old data
    // into data.json, which results in a quizSession with no answers submitted.
    const newData = getData();
    const newQuizSession = newData.quizSessions.find(
      (newQuizSession) => quizSession.quizSessionId === newQuizSession.quizSessionId
    );
    if (newQuizSession.state === 'QUESTION_OPEN') {
      newQuizSession.state = 'QUESTION_CLOSE';
      setData(newData);
    }
  }, duration * 1000));
};

/**
 * Change session state to QUESTION_COUNTDOWN state, calls a timeout for changing to QUESTION_OPEN state
 *
 * @param quizSession - The current quiz session
 */
export const toQuestionCountDownState = (quizSession: QuizSession, data: DataStore) => {
  if (quizSession.atQuestion === quizSession.metadata.numQuestions) {
    throw HTTPError(
      400,
      'Action enum cannot be applied in the current state'
    );
  }
  quizSession.state = 'QUESTION_COUNTDOWN';
  quizSession.atQuestion += 1;

  const timers = getTimers();
  timers.push(setTimeout(() => {
    // In during "duration" seconds, quizSession might get some new answers.
    // We need to consider that NEW state of quizSession.
    // If not, we are just considering the old quizSession, which doesnt have the state change.
    const newData = getData();
    const newQuizSession = newData.quizSessions.find(
      (newQuizSession) => quizSession.quizSessionId === newQuizSession.quizSessionId
    );
    if (newQuizSession.state === 'QUESTION_COUNTDOWN') {
      toQuestionOpenState(newQuizSession, newData);
    }
  }, 3000));
};

/**
 * Change session state to FINAL_RESULTS state, set atQuestion to 0
 *
 * @param quizSession - The current quiz session
 */
export const toFinalResultsState = (quizSession: QuizSession) => {
  quizSession.state = 'FINAL_RESULTS';
  quizSession.atQuestion = 0;
};

/**
 * Change session state to END state, set atQuestion to 0
 *
 * @param quizSession - The current quiz session
 */
export const toEndState = (quizSession: QuizSession) => {
  quizSession.state = 'END';
  quizSession.atQuestion = 0;
};

/**
 * Handles LOBBY state actions
 *
 * @param quizSession - The current quiz session
 * @param action - The action given to this state of the session
 */
export const handlesLobby = (quizSession: QuizSession, action: AdminAction, data: DataStore) => {
  if (action !== 'NEXT_QUESTION' && action !== 'END') {
    throw HTTPError(
      400,
      'Action enum cannot be applied in the current state'
    );
  }
  if (action === 'NEXT_QUESTION') {
    toQuestionCountDownState(quizSession, data);
  }
  if (action === 'END') {
    toEndState(quizSession);
  }
};

/**
 * Handles QUESTION_COUNTDOWN state actions
 *
 * @param quizSession - The current quiz session
 * @param action - The action given to this state of the session
 */
export const handlesQCD = (quizSession: QuizSession, action: AdminAction, data: DataStore) => {
  if (action !== 'SKIP_COUNTDOWN' && action !== 'END') {
    throw HTTPError(
      400,
      'Action enum cannot be applied in the current state'
    );
  }
  if (action === 'SKIP_COUNTDOWN') {
    toQuestionOpenState(quizSession, data);
  }
  if (action === 'END') {
    toEndState(quizSession);
  }
};

/**
 * Handles QUESTION_OPEN state actions
 *
 * @param quizSession - The current quiz session
 * @param action - The action given to this state of the session
 */
export const handlesQO = (quizSession: QuizSession, action: AdminAction) => {
  if (action !== 'GO_TO_ANSWER' && action !== 'END') {
    throw HTTPError(
      400,
      'Action enum cannot be applied in the current state'
    );
  }
  if (action === 'GO_TO_ANSWER') {
    quizSession.state = 'ANSWER_SHOW';
  }
  if (action === 'END') {
    toEndState(quizSession);
  }
};

/**
 * Handles QUESTION_CLOSE state actions
 *
 * @param quizSession - The current quiz session
 * @param action - The action given to this state of the session
 */
export const handlesQC = (quizSession: QuizSession, action: AdminAction, data: DataStore) => {
  if (action === 'SKIP_COUNTDOWN') {
    throw HTTPError(
      400,
      'Action enum cannot be applied in the current state'
    );
  }
  if (action === 'GO_TO_ANSWER') {
    quizSession.state = 'ANSWER_SHOW';
  }
  if (action === 'GO_TO_FINAL_RESULTS') {
    toFinalResultsState(quizSession);
  }
  if (action === 'END') {
    toEndState(quizSession);
  }
  if (action === 'NEXT_QUESTION') {
    toQuestionCountDownState(quizSession, data);
  }
};

/**
 * Handles ANSWER_SHOW state actions
 *
 * @param quizSession - The current quiz session
 * @param action - The action given to this state of the session
 */
export const handlesAS = (quizSession: QuizSession, action: AdminAction, data: DataStore) => {
  if (action === 'GO_TO_ANSWER' || action === 'SKIP_COUNTDOWN') {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }
  if (action === 'NEXT_QUESTION') {
    toQuestionCountDownState(quizSession, data);
  }
  if (action === 'GO_TO_FINAL_RESULTS') {
    toFinalResultsState(quizSession);
  }
  if (action === 'END') {
    toEndState(quizSession);
  }
};

/**
 * Handles FINAL_RESUTLS state actions
 *
 * @param quizSession - The current quiz session
 * @param action - The action given to this state of the session
 */
export const handlesFR = (quizSession: QuizSession, action: AdminAction) => {
  if (action !== 'END') {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }
  if (action === 'END') {
    toEndState(quizSession);
  }
};

export const questionResultHelper = (currSession: QuizSession, currQuestion: Question): {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentCorrect: number
} => {
  const correctSubmission = currSession.answerSubmitted.filter(
    (submission) =>
      submission.correct === true &&
      submission.questionId === currQuestion.questionId
  );
  const playersCorrectList = correctSubmission.map(
    (submission) => submission.playerName
  );

  const totalPlayer = currSession.players.length;
  const numPlayersCorrect = playersCorrectList.length;

  let percentCorrect = 0;
  if (totalPlayer !== 0) {
    percentCorrect = Math.round((numPlayersCorrect / totalPlayer) * 100);
  }

  const answerTimeList = currSession.answerSubmitted.filter(
    answer => answer.questionId === currQuestion.questionId
  ).map(
    (submission) => submission.answerTime
  );

  const totalAnswerTime = answerTimeList.reduce(
    (accumulator, currValue) => accumulator + currValue,
    0
  );

  let averageAnswerTime = 0;
  const playersWhoAttempted = currSession.answerSubmitted.filter(
    (submission) => submission.questionId === currQuestion.questionId
  ).length;

  if (playersWhoAttempted !== 0) {
    averageAnswerTime = Math.round(totalAnswerTime / playersWhoAttempted);
  }

  return {
    questionId: currQuestion.questionId,
    playersCorrectList: playersCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect,
  };
};

export const userRankedByScoreHelper = (quizSession: QuizSession): Array<{
  name: string,
  score: number
}> => {
  const quizQuestions = quizSession.metadata.questions;

  // scoreObject is an object that store pairs of playerName : score
  const scoreObject: Record<string, number> = {};
  quizSession.players.forEach((playerName) => {
    scoreObject[playerName] = 0;
  });

  quizQuestions.forEach((quizQuestion) => {
    const questionId = quizQuestion.questionId;
    const correctAnswersSubmittedTo = quizSession.answerSubmitted.filter(
      (answer) => answer.questionId === questionId && answer.correct
    );
    const points = quizQuestion.points;
    let rank = 1;
    correctAnswersSubmittedTo.forEach((answer) => {
      // Round points to 1 decimal place
      scoreObject[answer.playerName] += parseFloat(Number(points * (1 / rank)).toFixed(1));
      rank += 1;
    });
  });

  const scoreList = [];
  for (const playerName in scoreObject) {
    scoreList.push({
      name: playerName,
      score: scoreObject[playerName]
    });
  }

  return scoreList.sort((a, b) => b.score - a.score);
};
