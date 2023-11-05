import request from 'sync-request-curl';
import { port, url } from './config.json';
import {
  EmptyObject,
  ReturnedToken,
  QuizList
} from './types';

const SERVER_URL = `${url}:${port}`;

/**
 * Logs out a user by sending a POST request to the server's logout endpoint.
 *
 * @param tokenObject - An object containing the authentication token for user logout.
 * @param tokenObject.token - The authentication token for the request.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the user logout request.
 */
export const adminAuthLogout = (
  tokenObject: ReturnedToken
): {
  content: EmptyObject,
  statusCode: number
} => {
  const route = '/v2/admin/auth/logout';

  const res = request('POST', SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Empties the trash (permanently deletes quizzes) by sending a DELETE request to the server's trash emptying endpoint.
 *
 * @param tokenObject - An object containing the authentication token for emptying the trash.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizIds - A string containing the IDs of quizzes to be permanently deleted, separated by commas.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the trash emptying request.
 */
export const adminQuizTrashEmpty = (
  tokenObject: ReturnedToken,
  quizIds: string
): {content: EmptyObject, statusCode: number} => {
  const route = '/v2/admin/quiz/trash/empty';
  const res = request('DELETE', SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
    qs: {
      quizIds: quizIds
    }
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};

/**
 * Restores a quiz by sending a POST request to the server's quiz restoration endpoint.
 *
 * @param tokenObject - An object containing the authentication token for quiz restoration.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz to be restored.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the quiz restoration request.
 */
export const adminQuizRestore = (
  tokenObject: ReturnedToken,
  quizId: number
): { content: EmptyObject; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v2/admin/quiz/' + quizId + '/restore', {
    headers: {
      token: tokenObject.token
    },
  });
  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Views the list of quizzes in the "trash" by sending a GET request to the server's trash quiz list endpoint.
 *
 * @param tokenObject - An object containing the authentication token for viewing the trash quiz list.
 * @param tokenObject.token - The authentication token for the request.
 *
 * @returns An object containing the response content (QuizList or ErrorObject) and the HTTP status code of the trash quiz list request.
 */
export const adminQuizViewTrash = (tokenObject: {
  token: string;
}): { content: QuizList; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v2/admin/quiz/trash', {
    headers: {
      token: tokenObject.token,
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Updates the description of a quiz by sending a PUT request to the server's quiz description update endpoint.
 *
 * @param tokenObject - An object containing the authentication token for quiz description update.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz for which the description is to be updated.
 * @param description - The new description for the quiz.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the quiz description update request.
 */
export const adminQuizDescriptionUpdate = (
  tokenObject: ReturnedToken,
  quizId: number,
  description: string
): { content: EmptyObject; statusCode: number } => {
  const route = '/v2/admin/quiz/' + quizId + '/description';

  const res = request('PUT', SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
    json: {
      description: description,
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Transfers a quiz to another user by sending a POST request to the server's quiz transfer endpoint.
 *
 * @param quizId - The unique identifier of the quiz to be transferred.
 * @param tokenObject - An object containing the authentication token for the transfer.
 * @param tokenObject.token - The authentication token for the request.
 * @param userEmail - The email address of the user to whom the quiz should be transferred.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the quiz transfer request.
 */
export const adminQuizTransfer = (
  quizId: number,
  tokenObject: ReturnedToken,
  userEmail: string
): {content: EmptyObject, statusCode: number} => {
  const route = '/v2/admin/quiz/' + quizId + '/transfer';

  const res = request('POST', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
      userEmail: userEmail
    }
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};

/**
 * Deletes a question within a quiz by sending a DELETE request to the server's question deletion endpoint.
 *
 * @param tokenObject - An object containing the authentication token for question deletion.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz containing the question to be deleted.
 * @param questionId - The unique identifier of the question to be deleted.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the question deletion request.
 */
export const adminQuizDeleteQuestion = (
  tokenObject: ReturnedToken,
  quizId: number,
  questionId: number
): {content: EmptyObject, statusCode: number} => {
  const route = '/v2/admin/quiz/' + quizId + '/question/' + questionId;

  const res = request('DELETE', SERVER_URL + route, {
    qs: {
      token: tokenObject.token,
    }
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};

/**
 * Moves a question within a quiz by sending a PUT request to the server's move question endpoint.
 *
 * @param tokenObject - An object containing the authentication token for the question move.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz containing the question.
 * @param questionId - The unique identifier of the question to be moved.
 * @param newPosition - The new position for the question within the quiz.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the question move request.
 */
export const adminQuizMoveQuestion = (
  tokenObject: ReturnedToken,
  quizId: number,
  questionId: number,
  newPosition: number
): { content: EmptyObject; statusCode: number } => {
  const route =
    '/v2/admin/quiz/' + quizId + '/question/' + questionId + '/move';
  const res = request('PUT', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
      newPosition: newPosition,
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};
