import request from "sync-request-curl";

import { port, url } from "./config.json";
import { EmptyObject, ErrorObject } from "./types";
import { Question } from "./types";

const SERVER_URL = `${url}:${port}`;

export const adminQuizRemove = (
  token: { token: string },
  quizId: number
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route = "/v1/admin/quiz/" + quizId;

  const res = request("DELETE", SERVER_URL + route, {
    qs: {
      token: token,
    },
  });

  return {
    content: JSON.parse(res.body as string),
    statusCode: res.statusCode,
  };
};

export const adminQuizInfo = (
  token: { token: string },
  quizId: number
): {
  content:
    | {
        quizId: number;
        name: string;
        description: string;
        timeCreated: number;
        timeLastEdited: number;
        questions: Question[];
        numQuestions: number;
        duration: number;
      }
    | ErrorObject;
  statusCode: number;
} => {
  const route = "/v1/admin/quiz/" + quizId;

  const res = request("GET", SERVER_URL + route, {
    qs: {
      token: token,
    },
  });

  return {
    content: JSON.parse(res.body as string),
    statusCode: res.statusCode,
  };
};

export const adminQuizNameUpdate = (
  token: { token: string },
  name: string,
  quizId: number
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route = "/v1/admin/quiz/" + quizId + "name";

  const res = request("PUT", SERVER_URL + route, {
    json: {
      token: token.token,
      name: name,
    },
  });

  return {
    content: JSON.parse(res.body as string),
    statusCode: res.statusCode,
  };
};

export const adminQuizDescriptionUpdate = (
  token: { token: string },
  description: string,
  quizId: number
): { content: EmptyObject | ErrorObject; statusCode: number } => {
  const route = "/v1/admin/quiz/" + quizId + "description";

  const res = request("PUT", SERVER_URL + route, {
    json: {
      token: token.token,
      description: description,
    },
  });

  return {
    content: JSON.parse(res.body as string),
    statusCode: res.statusCode,
  };
};

export const clear = (): { content: EmptyObject; statusCode: number } => {
  const route = "/v1/clear";

  const res = request("DELETE", SERVER_URL + route);

  return {
    content: JSON.parse(res.body as string),
    statusCode: res.statusCode,
  };
};
