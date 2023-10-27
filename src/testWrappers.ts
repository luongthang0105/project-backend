import request from 'sync-request-curl';
import { port, url } from './config.json';
import {
  Answer,
  EmptyObject,
  ErrorObject,
  Quiz,
  QuizList,
  QuizObject,
  ReturnedToken,
  UserDetails,
} from './types';

const SERVER_URL = `${url}:${port}`;

/**
 * Registers a user by sending a POST request to the server's registration endpoint.
 *
 * @param email - The email address for the user's registration.
 * @param password - The password for the user's registration.
 * @param nameFirst - The user's first name for registration.
 * @param nameLast - The user's last name for registration.
 *
 * @returns An object containing the response content (ReturnedToken or ErrorObject) and the HTTP status code of the registration request.
 */
export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): { content: ReturnedToken | ErrorObject; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });
  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Logs a user in by sending a POST request to the server's login endpoint.
 *
 * @param email - The user's email address for login.
 * @param password - The user's password for login.
 *
 * @returns An object containing the response content (ReturnedToken or ErrorObject) and the HTTP status code of the login request.
 */
export const adminAuthLogin = (
  email: string,
  password: string
): { content: ReturnedToken | ErrorObject; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: {
      email: email,
      password: password,
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
}): { content: UserDetails | ErrorObject; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v1/admin/user/details', {
    qs: {
      token: tokenObject.token,
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
}): { content: QuizList | ErrorObject; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    qs: {
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
): { content: Quiz | ErrorObject; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: {
      token: tokenObject.token,
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
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId + '/restore', {
    json: {
      token: tokenObject.token
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
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route = '/v1/admin/quiz/' + quizId;

  const res = request('DELETE', SERVER_URL + route, {
    qs: {
      token: tokenObject.token,
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
  content: QuizObject | ErrorObject;
  statusCode: number;
} => {
  const route = '/v1/admin/quiz/' + quizId;

  const res = request('GET', SERVER_URL + route, {
    qs: {
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
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route = '/v1/admin/quiz/' + quizId + '/name';

  const res = request('PUT', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
      name: name,
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
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route = '/v1/admin/quiz/' + quizId + '/description';

  const res = request('PUT', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
      description: description,
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

/**
 * Sends a DELETE request to a server endpoint to clear data.
 *
 * @returns An object containing the response content (EmptyObject) and the HTTP status code of the clear request.
 */
export const clear = (): { content: EmptyObject; statusCode: number } => {
  const route = '/v1/clear';

  const res = request('DELETE', SERVER_URL + route);

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
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
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route =
    '/v1/admin/quiz/' + quizId + '/question/' + questionId + '/move';
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
}): { content: QuizList | ErrorObject; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
    qs: {
      token: tokenObject.token,
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
  answers: Answer[]
): { content: { questionId: number } | ErrorObject; statusCode: number } => {
  const route = '/v1/admin/quiz/' + quizId + '/question';

  const res = request('POST', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
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

/**
 * Duplicates a question within a quiz by sending a POST request to the server's duplicate question endpoint.
 *
 * @param tokenObject - An object containing the authentication token for question duplication.
 * @param tokenObject.token - The authentication token for the request.
 * @param quizId - The unique identifier of the quiz containing the question to be duplicated.
 * @param questionId - The unique identifier of the question to be duplicated.
 *
 * @returns An object containing the response content (newQuestionId or ErrorObject) and the HTTP status code of the question duplication request.
 */
export const adminQuizDuplicateQuestion = (
  tokenObject: ReturnedToken,
  quizId: number,
  questionId: number
): { content: { newQuestionId: number } | ErrorObject; statusCode: number } => {
  const route =
    '/v1/admin/quiz/' + quizId + '/question/' + questionId + '/duplicate';

  const res = request('POST', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

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
  content:
    EmptyObject | ErrorObject;
  statusCode: number;
} => {
  const route = '/v1/admin/logout';

  const res = request('POST', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
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
): {content: EmptyObject | ErrorObject, statusCode: number} => {
  const route = '/v1/admin/quiz/' + quizId + '/question/' + questionId;

  const res = request('PUT', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
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
): {content: EmptyObject | ErrorObject, statusCode: number} => {
  const route = '/v1/admin/quiz/' + quizId + '/question/' + questionId;

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
 * Updates user details (email, first name, and last name) by sending a PUT request to the server's user details update endpoint.
 *
 * @param tokenObject - An object containing the authentication token for user details update.
 * @param tokenObject.token - The authentication token for the request.
 * @param email - The updated email address for the user.
 * @param nameFirst - The updated first name for the user.
 * @param nameLast - The updated last name for the user.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the user details update request.
 */
export const adminUserDetailsUpdate = (
  tokenObject: ReturnedToken,
  email: string,
  nameFirst: string,
  nameLast: string
): {content: EmptyObject | ErrorObject, statusCode: number} => {
  const route = '/v1/admin/user/details';

  const res = request('PUT', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
      email: email,
      nameFirst: nameFirst,
      nameLast: nameLast,
    }
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
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
): {content: EmptyObject | ErrorObject, statusCode: number} => {
  const route = '/v1/admin/quiz/' + quizId + '/transfer';

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
 * Updates a user's password by sending a PUT request to the server's password update endpoint.
 *
 * @param tokenObject - An object containing the authentication token for password update.
 * @param tokenObject.token - The authentication token for the request.
 * @param oldPassword - The user's current/old password.
 * @param newPassword - The user's new password.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the password update request.
 */
export const adminUserPasswordUpdate = (
  tokenObject: { token: string },
  oldPassword: string,
  newPassword: string
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route = '/v1/admin/user/password';

  const res = request('PUT', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
      oldPassword: oldPassword,
      newPassword: newPassword,
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
): {content: EmptyObject | ErrorObject, statusCode: number} => {
  const route = '/v1/admin/quiz/trash/empty';
  const res = request('DELETE', SERVER_URL + route, {
    qs: {
      token: tokenObject.token,
      quizIds: quizIds
    }
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};
