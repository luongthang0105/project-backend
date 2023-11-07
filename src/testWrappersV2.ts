import request from 'sync-request-curl';
import { port, url } from './config.json';
import {
  EmptyObject,
  ReturnedToken,
  QuizList,
  Quiz,
  Answer,
  QuizObject,
  UserDetails,
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
<<<<<<< HEAD
<<<<<<< HEAD
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

/**
 * Updates the name of a quiz by sending a PUT request to the server's quiz name update endpoint.
 *
 * @param tokenObject - An object containing the authentication token for quiz name update.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz for which the name is to be updated.
 * @param name - The new name for the quiz.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the quiz name update request.
 */
export const adminQuizNameUpdate = (
  tokenObject: ReturnedToken,
  quizId: number,
  name: string
): { content: EmptyObject; statusCode: number } => {
  const route = '/v2/admin/quiz/' + quizId + '/name';

  const res = request('PUT', SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
    json: {
      name: name
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Creates a new question within a quiz by sending a POST request to the server's create question endpoint.
 *
 * @param tokenObject - An object containing the authentication token for question creation.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz where the question will be created.
 * @param question - The text of the question.
 * @param duration - The duration (in seconds) allowed for answering the question.
 * @param points - The number of points assigned to the question.
 * @param answers - An array of answer options for the question.
 *
 * @returns An object containing the response content (questionId or ErrorObject) and the HTTP status code of the question creation request.
 */
export const adminQuizCreateQuestion = (
  tokenObject: ReturnedToken,
  quizId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[],
  thumbnailUrl: string
): { content: { questionId: number }; statusCode: number } => {
  const route = '/v2/admin/quiz/' + quizId + '/question';

  const res = request('POST', SERVER_URL + route, {
    headers: {
      token: tokenObject.token
    },
    json: {
      questionBody: {
        question: question,
        duration: duration,
        points: points,
        answers: answers,
        thumbnailUrl: thumbnailUrl
      },
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Retrieves information about a quiz by sending a GET request to the server's quiz information endpoint.
 *
 * @param tokenObject - An object containing the authentication token for quiz information retrieval.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz for which information is requested.
 *
 * @returns An object containing the response content (QuizObject or ErrorObject) and the HTTP status code of the quiz information request.
 */
export const adminQuizInfo = (
  tokenObject: ReturnedToken,
  quizId: number
): {
  content: QuizObject;
  statusCode: number;
} => {
  const route = '/v2/admin/quiz/' + quizId;

  const res = request('GET', SERVER_URL + route, {
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
 * Retrieves user details by sending a GET request to the server's user details endpoint.
 *
 * @param tokenObject - An object containing the authentication token for user details retrieval.
 * @param tokenObject.token - The authentication token for the request.
 *
 * @returns An object containing the response content (UserDetails or ErrorObject) and the HTTP status code of the user details request.
 */
export const adminUserDetails = (tokenObject: {
  token: string;
}): { content: UserDetails; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v2/admin/user/details', {
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
=======
>>>>>>> 26e267401302ab92701177c7168b32239135057a
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
