import request from 'sync-request-curl';
import { port, url } from './config.json';
import { Answer, EmptyObject, ErrorObject, Quiz, QuizList, QuizObject, ReturnedToken, UserDetails } from './types';

const SERVER_URL = `${url}:${port}`;

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

export const adminUserDetails = (tokenObject: {
  token: string
}): { content: UserDetails | ErrorObject; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v1/admin/user/details', {
    qs: {
      token: tokenObject.token
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

export const adminQuizList = (tokenObject: {
  token: string
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

export const adminQuizCreate = (
  tokenObject: {
    token: string
  },
  name: string,
  description: string
): { content: Quiz | ErrorObject; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: {
      token: tokenObject.token,
      name: name,
      description: description
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

export const adminQuizRestore = (
  tokenObject: ReturnedToken,
  quizId: number,
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz' + quizId + '/restore', {
    json: {
      token: tokenObject.token
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };

}

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

export const adminQuizInfo = (
  tokenObject: ReturnedToken,
  quizId: number
): {
  content:
    QuizObject | ErrorObject;
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

export const clear = (): { content: EmptyObject; statusCode: number } => {
  const route = '/v1/clear';

  const res = request('DELETE', SERVER_URL + route);

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

export const adminQuizViewTrash = (tokenObject: {
  token: string
}): { content: QuizList | ErrorObject; statusCode: number } => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
    qs: {
      token: tokenObject.token
    },
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
};

export const adminQuizCreateQuestion = (
  tokenObject: ReturnedToken,
  quizId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
): {content: { questionId: number } | ErrorObject, statusCode: number} => {
  const route = '/v1/admin/quiz/' + quizId + '/question';

  const res = request('POST', SERVER_URL + route, {
    json: {
      token: tokenObject.token,
      questionBody: {
        question: question,
        duration: duration,
        points: points,
        answers: answers
      }
    }
  });

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};
