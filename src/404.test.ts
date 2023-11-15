import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

describe("Error: 404", () => {
  test("Calling non-existent route", () => {
    const res = request("GET", SERVER_URL + '/nonexistentroute');
    expect(res.statusCode).toBe(404);
  })
})