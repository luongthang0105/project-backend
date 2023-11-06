import request from 'sync-request-curl';
import { port, url } from './config.json';
import { EmptyObject, ReturnedToken, QuizList, Answer } from './types';

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
  content: EmptyObject;
  statusCode: number;
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
): { content: EmptyObject; statusCode: number } => {
  const route = '/v2/admin/quiz/trash/empty';
  const res = request('DELETE', SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
    qs: {
      quizIds: quizIds,
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
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/quiz/' + quizId + '/restore',
    {
      headers: {
        token: tokenObject.token,
      },
    }
  );
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
 * Updates the details of a question within a quiz by sending a PUT request to the server's question update endpoint.
 *
 * @param tokenObject - An object containing the authentication token for question update.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz containing the question to be updated.
 * @param questionId - The unique identifier of the question to be updated.
 * @param question - The updated text of the question.
 * @param duration - The updated duration (in seconds) allowed for answering the question.
 * @param points - The updated number of points assigned to the question.
 * @param answers - An array of updated answer options for the question.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the question update request.
 */
export const adminQuizQuestionUpdate = (
  tokenObject: ReturnedToken,
  quizId: number,
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
): { content: EmptyObject; statusCode: number } => {
  const route = '/v2/admin/quiz/' + quizId + '/question/' + questionId;

  const res = request('PUT', SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
    json: {
      questionBody: {
        question: question,
        duration: duration,
        points: points,
        answers: answers,
      },
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};
