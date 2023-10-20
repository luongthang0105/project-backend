import request from "sync-request-curl"
import { port, url } from "./config.json"
import { ErrorObject, Quiz, QuizList, Token } from "./types"

const SERVER_URL = `${url}:${port}`

export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
): { content: { token: string } | ErrorObject; statusCode: number } => {
  const res = request("POST", SERVER_URL + "/v1/admin/auth/register", {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  })

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  }
}

export const adminAuthLogin = (
  email: string,
  password: string,
): { content: { token: string } | ErrorObject; statusCode: number } => {
  const res = request("POST", SERVER_URL + "/v1/admin/auth/login", {
    json: {
      email: email,
      password: password,
    },
  })
  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  }
}

export const adminUserDetails = (token: {
  token: string
}): { content: ErrorObject; statusCode: number } => {
  const res = request("GET", SERVER_URL + "/v1/admin/user/details", {
    qs: {
      token: token,
    },
  })

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  }
}

export const adminQuizList = (token: {
  token: string
}): { content: QuizList | ErrorObject; statusCode: number } => {
  const res = request("GET", SERVER_URL + "/v1/admin/quiz/list", {
    qs: {
      token: token,
    },
  })

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  }
}

export const adminQuizCreate = (
  token: {
    token: string
  },
  name: string,
  description: string,
): { content: Quiz | ErrorObject; statusCode: number } => {
  const res = request("POST", SERVER_URL + "/v1/admin/quiz", {
    json: {
      token: token,
			name: name,
			description: description
    },
  })

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  }
}
