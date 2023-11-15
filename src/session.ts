import { getData, setData } from './dataStore';
import {
  handlesAS,
  handlesFR,
  handlesLobby,
  handlesQC,
  handlesQCD,
  handlesQO,
} from './sessionHelper';
import { QuizObject, QuizSession, AdminAction, EmptyObject } from './types';
import HTTPError from 'http-errors';
/**
 * Creates a new quiz session
 * This copies the quiz, so that any edits whilst a session is running does not affect active session
 * @param {string} Token - Token of the quiz owner
 * @param {number} quizId - ID of the quiz
 * @param {number} autoStartNum - The number people needed to automatically start the quiz
 * @returns {sessionId: number} - ID of the quiz session
 */
const adminQuizSessionStart = (
  token: string,
  quizId: number,
  autoStartNum: number
): { sessionId: number } => {
  const data = getData();
  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Error: Token is empty or invalid (does not refer to valid logged in user session)
  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  // Error: Valid token is provided, but user is unauthorised to complete this action
  const authUserId = validSession.authUserId;
  const validQuiz = data.quizzes.find(
    (currQuiz) => currQuiz.quizId === quizId
  ) as QuizObject;

  if (validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }
  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum is a number greater than 50');
  }

  let numNotEndState = 0;
  for (const session of data.quizSessions) {
    if (session.state !== 'END') {
      numNotEndState += 1;
    }
  }

  if (numNotEndState >= 10) {
    throw HTTPError(
      400,
      'A maximum of 10 sessions that are not in END state currently exist'
    );
  }

  if (validQuiz.questions.length === 0) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }

  const newQuizSession: QuizSession = {
    quizSessionId: data.nextQuizSessionId,
    state: 'LOBBY',
    atQuestion: 0,
    players: [],
    metadata: validQuiz as QuizObject,
    autoStartNum: autoStartNum,
    messages: []
  };

  data.nextQuizSessionId += 1;
  data.quizSessions.push(newQuizSession);
  setData(data);

  return { sessionId: newQuizSession.quizSessionId };
};

/**
 * Get the status of a particular quiz session
 *
 * @param {string} Token - Token of the quiz owner
 * @param {number} quizId - ID of the quiz
 * @param {number} sessionId - ID of the quiz session
 * @returns {QuizSession} - Status of the quiz session
 */
const adminQuizGetSessionStatus = (
  token: string,
  quizId: number,
  sessionId: number
): QuizSession => {
  const data = getData();
  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Error: Token is empty or invalid (does not refer to valid logged in user session)
  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  // Error: Valid token is provided, but user is unauthorised to complete this action
  const authUserId = validSession.authUserId;
  const validQuiz = data.quizzes.find(
    (currQuiz) => currQuiz.quizId === quizId
  ) as QuizObject;

  if (!validQuiz || validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not authorised to view this session'
    );
  }

  const validQuizSesssion = data.quizSessions.find(
    (session) => session.quizSessionId === sessionId
  );
  if (!validQuizSesssion) {
    throw HTTPError(
      400,
      'Session Id does not refer to a valid session within this quiz'
    );
  }

  if (validQuizSesssion.metadata.quizId !== quizId) {
    throw HTTPError(
      400,
      'Session Id does not refer to a valid session within this quiz'
    );
  }

  let thumbnail: string;
  if (!validQuizSesssion.metadata.thumbnailUrl) {
    thumbnail = '';
  } else {
    thumbnail = validQuizSesssion.metadata.thumbnailUrl;
  }

  const quizSessionStatus: QuizSession = {
    state: validQuizSesssion.state,
    atQuestion: validQuizSesssion.atQuestion,
    players: validQuizSesssion.players,
    metadata: {
      quizId: validQuizSesssion.metadata.quizId,
      name: validQuizSesssion.metadata.name,
      timeCreated: validQuizSesssion.metadata.timeCreated,
      timeLastEdited: validQuizSesssion.metadata.timeLastEdited,
      description: validQuizSesssion.metadata.description,
      numQuestions: validQuizSesssion.metadata.numQuestions,
      questions: validQuizSesssion.metadata.questions,
      duration: validQuizSesssion.metadata.duration,
      thumbnailUrl: thumbnail,
    },
    messages: []
  };

  return quizSessionStatus;
};

/**
 * Update the state of a particular session by sending an action command
 *
 * @param {string} Token - Token of the quiz owner
 * @param {number} quizId - ID of the quiz
 * @param {number} sessionId - ID of the quiz session
 * @param {string} action - action command
 * @returns {} -
 */
const adminQuizSessionStateUpdate = (
  token: string,
  quizId: number,
  sessionId: number,
  action: string
): EmptyObject => {
  const data = getData();
  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Error: Token is empty or invalid (does not refer to valid logged in user session)
  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  // Error: Valid token is provided, but user is unauthorised to complete this action
  const authUserId = validSession.authUserId;
  const validQuiz = data.quizzes.find(
    (currQuiz) => currQuiz.quizId === quizId
  ) as QuizObject;

  if (!validQuiz || validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not authorised to view this session'
    );
  }

  const validQuizSesssion = data.quizSessions.find(
    (session) => session.quizSessionId === sessionId
  );
  if (!validQuizSesssion) {
    throw HTTPError(
      400,
      'Session Id does not refer to a valid session within this quiz'
    );
  }
  if (validQuizSesssion.metadata.quizId !== quizId) {
    throw HTTPError(
      400,
      'Session Id does not refer to a valid session within this quiz'
    );
  }
  if (
    ![
      'NEXT_QUESTION',
      'SKIP_COUNTDOWN',
      'GO_TO_ANSWER',
      'GO_TO_FINAL_RESULTS',
      'END',
    ].includes(action as AdminAction)
  ) {
    throw HTTPError(400, 'Action provided is not a valid Action enum');
  }

  // Current state: LOBBY
  switch (validQuizSesssion.state) {
    case 'LOBBY':
      handlesLobby(validQuizSesssion, action as AdminAction, data);
      break;

    case 'QUESTION_COUNTDOWN':
      handlesQCD(validQuizSesssion, action as AdminAction, data);
      break;

    case 'QUESTION_OPEN':
      handlesQO(validQuizSesssion, action as AdminAction);
      break;

    case 'QUESTION_CLOSE':
      handlesQC(validQuizSesssion, action as AdminAction, data);
      break;

    case 'ANSWER_SHOW':
      handlesAS(validQuizSesssion, action as AdminAction, data);
      break;

    case 'FINAL_RESULTS':
      handlesFR(validQuizSesssion, action as AdminAction);
      break;

    // case "END"
    default:
      throw HTTPError(
        400,
        'Action enum cannot be applied in the current state'
      );
  }

  setData(data);
  return {};
};

const adminQuizViewSessions = (token: string, quizId: number) => {
  // Retrieve the current data
  const data = getData();

  const validSession = data.sessions.find(
    (currToken) => currToken.identifier === token
  );

  if (token === '' || !validSession) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  const authUserId = validSession.authUserId;

  // Find the quiz with the specified quizId and check if it exists
  const validQuiz = data.quizzes.find(
    (quiz: QuizObject) => quiz.quizId === quizId
  );

  // Return an error message if the quiz with the given quizId does not exist
  // Check if the quiz with the given quizId is owned by the authenticated user
  if (!validQuiz || validQuiz.quizAuthorId !== authUserId) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  const allSessions = data.quizSessions.filter(
    (session) => session.metadata.quizId === quizId
  );

  const inactiveSessions = allSessions.filter(
    (session) => session.state === 'END'
  );

  // let sortedInactive = inactiveSessions.sort((s1, s2) => {
  //   if (s1.quizSessionId !== s2.quizSessionId) {
  //     return s1.quizSessionId - s2.quizSessionId;
  //   }
  //   return 0;
  // });
  const inactiveSessionIds = inactiveSessions.map(
    (session) => session.quizSessionId
  );

  const activeSessions = allSessions.filter(
    (session) => session.state !== 'END'
  );

  // let sortedActive = activeSessions.sort((s1, s2) => {
  //   if (s1.quizSessionId !== s2.quizSessionId) {
  //     return s1.quizSessionId - s2.quizSessionId;
  //   }
  //   return 0;
  // });
  const activeSessionIds = activeSessions.map((session) => session.quizSessionId);

  return {
    activeSessions: activeSessionIds,
    inactiveSessions: inactiveSessionIds,
  };
};
export {
  adminQuizSessionStart,
  adminQuizGetSessionStatus,
  adminQuizViewSessions,
  adminQuizSessionStateUpdate,
};
