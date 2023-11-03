import request from 'sync-request-curl';
import { port, url } from './config.json';
import {
  EmptyObject,
  ReturnedToken,
  QuizList,
  Quiz
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
 * Retrieves a list of quizzes by sending a GET request to the server's quiz list endpoint.
 *
 * @param tokenObject - An object containing the authentication token for quiz list retrieval.
 * @param tokenObject.token - The authentication token for the request.
 *
 * @returns An object containing the response content (QuizList or ErrorObject) and the HTTP status code of the quiz list request.
 */
export const adminQuizList = (tokenObject: {
  token: string;
}): { content: QuizList; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v2/admin/quiz/list', {
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
 * Creates a quiz by sending a POST request to the server's quiz creation endpoint.
 *
 * @param tokenObject - An object containing the authentication token for quiz creation.
 * @param tokenObject.token - The authentication token for the request.
 * @param name - The name or title of the quiz to be created.
 * @param description - A brief description of the quiz.
 *
 * @returns An object containing the response content (Quiz or ErrorObject) and the HTTP status code of the quiz creation request.
 */
export const adminQuizCreate = (
  tokenObject: {
    token: string;
  },
  name: string,
  description: string
): { content: Quiz; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: {
      token: tokenObject.token,
    },
    json: {
      name: name,
      description: description,
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Removes a quiz by sending a DELETE request to the server's quiz removal endpoint.
 *
 * @param tokenObject - An object containing the authentication token for quiz removal.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz to be removed.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the quiz removal request.
 */
export const adminQuizRemove = (
  tokenObject: ReturnedToken,
  quizId: number
): { content: EmptyObject; statusCode: number } => {
  const route = '/v2/admin/quiz/' + quizId;

  const res = request('DELETE', SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
  });
  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};
