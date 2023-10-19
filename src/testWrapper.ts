import request from "sync-request-curl"
import { port, url } from "./config.json"

const SERVER_URL = `${url}:${port}`

export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
): {
  content: { token: string }
  statusCode: number
} => {
  const res = request(
    "POST",
    SERVER_URL + "/v1/admin/auth/register",

    // Not necessary, since it's empty, though reminder that
    // GET/DELETE is `qs`, PUT/POST is `json`
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      },
    },
  )

  return {
    content: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  }
}
