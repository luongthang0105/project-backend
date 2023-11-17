// YOU SHOULD MODIFY THIS OBJECT BELOW
import fs from 'fs';
import { DataStore, Player, QuizObject, QuizSession, Token, UserObject } from './types';
import { port, url } from './config.json';
import request from 'sync-request'
const SERVER_URL = `${url}:${port}`;

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()

    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

const timers: ReturnType<typeof setTimeout>[] = [];

// Use get() to access the data
const getData = (): DataStore => {
  // JSON.parse(String(fs.readFileSync('./data.json')))
  try {
    const res = request('GET', SERVER_URL + '/data', {});
    // console.log(res)
    return JSON.parse(res.body.toString());
  } catch (e) {
    return {
      users: [] as UserObject[],
      quizzes: [] as QuizObject[],
      trash: [] as QuizObject[],
      sessions: [] as Token[],
      quizSessions: [] as QuizSession[],
      players: [] as Player[],
      nextUserId: 0,
      nextQuizId: 0,
      nextQuestionId: 0,
      nextAnswerId: 0,
      nextQuizSessionId: 0,
      nextPlayerId: 0
    };
  }
};

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore) {
  // fs.writeFileSync('./data.json', JSON.stringify(newData, null, 2));
  request('PUT', SERVER_URL + '/data', {
    json: {
      data: newData
    }
  });
}

// Use getTimers() to access all timers during the session of the program
const getTimers = (): ReturnType<typeof setTimeout>[] => timers;

export { getData, setData, getTimers };
