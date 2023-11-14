import { getData, setData } from "./dataStore";
import HTTPError from "http-errors";
import { generateRandomName } from "./playerHelper";
import { Player } from "./types";
import { randomSessionId } from "./authHelper";
import { adminQuizSessionStateUpdate } from "./session";
import { toQuestionCountDownState } from "./sessionHelper";

export const playerJoinSession = (sessionId: number, name: string): { playerId: number } => {
  const data = getData();

  const validSession = data.quizSessions.find( (quizSession) => quizSession.quizSessionId === sessionId);
  
  // Error: Session does not exist
  if (!validSession) {
    throw HTTPError(400, "Session doesn't exist (this is undefined behaviour and won't be tested)")
  }

  // Error: Session is not in LOBBY state
  if (validSession.state !== 'LOBBY') {
    throw HTTPError(400, "Session is not in LOBBY state")
    
  }

  
  // If name is empty, randomly generate it according to the structure [5 letters][3 numbers],
  // where there are no repetitions of numbers or characters within the same name
  if (name === '') {
    // generate the random name and make sure it's unique among the others name in the session
    while (true) {
      name = generateRandomName();
      let playerWithSameName = validSession.players.find( (playerName) => playerName === name)
      
      if (!playerWithSameName) break;
    }
  } 
  
  // If name is not empty, check for this:
  // Error: Name of user entered is not unique (compared to other users who have already joined)
  else {
    let playerWithSameName = validSession.players.find( (playerName) => playerName === name)
    if (playerWithSameName) {
      throw HTTPError(400, "Name of user entered is not unique (compared to other users who have already joined)")
    }
  }

  const newPlayer: Player = {
    playerId: data.nextPlayerId,
    name: name,
    sessionJoined: sessionId
  }

  data.nextPlayerId += 1;
  // add new player to data
  data.players.push(newPlayer);

  // add players name to session players field
  validSession.players.push(name);

  if (validSession.players.length === validSession.autoStartNum) {
    // If number of players reach autoStartNum, then starts the game
    toQuestionCountDownState(validSession, data);
  }
  setData(data);
  
  return { playerId: newPlayer.playerId };
}