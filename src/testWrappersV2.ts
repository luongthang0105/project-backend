import request from "sync-request-curl"
import { port, url } from "./config.json"
import {
  Answer,
  EmptyObject,
  ErrorObject,
  Quiz,
  QuizList,
  QuizObject,
  ReturnedToken,
  UserDetails,
} from "./types"

const SERVER_URL = `${url}:${port}`

/**
 * Logs out a user by sending a POST request to the server's logout endpoint.
 *
 * @param tokenObject - An object containing the authentication token for user logout.
 * @param tokenObject.token - The authentication token for the request.
 *
 * @returns An object containing the response content (EmptyObject or ErrorObject) and the HTTP status code of the user logout request.
 */
export const adminAuthLogout = (
  tokenObject: ReturnedToken,
): {
  content: EmptyObject | ErrorObject
  statusCode: number
} => {
  const route = "/v2/admin/auth/logout"

  const res = request("POST", SERVER_URL + route, {
    headers: {
      token: tokenObject.token,
    },
  })

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  }
}
