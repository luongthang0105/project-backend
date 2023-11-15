import { getData, setData } from "./dataStore";
import HTTPError from "http-errors";
import { generateRandomName } from "./playerHelper";
import { Player, Message } from "./types";
import { toQuestionCountDownState } from "./sessionHelper";
import { getCurrentTimestamp, newAnswerList } from "./quizHelper";

export const playerJoinSession = (
  sessionId: number,
  name: string
): { playerId: number } => {
  const data = getData();

  const validSession = data.quizSessions.find(
    (quizSession) => quizSession.quizSessionId === sessionId
  );

  // Error: Session does not exist
  if (!validSession) {
    throw HTTPError(
      400,
      "Session doesn't exist (this is undefined behaviour and won't be tested)"
    );
  }

  // Error: Session is not in LOBBY state
  if (validSession.state !== "LOBBY") {
    throw HTTPError(400, "Session is not in LOBBY state");
  }

  // If name is empty, randomly generate it according to the structure [5 letters][3 numbers],
  // where there are no repetitions of numbers or characters within the same name
  if (name === "") {
    // generate the random name and make sure it's unique among the others name in the session
    while (true) {
      name = generateRandomName();
      const playerWithSameName = validSession.players.find(
        (playerName) => playerName === name
      );

      if (!playerWithSameName) break;
    }
  } else {
    // If name is not empty, check for this:
    // Error: Name of user entered is not unique (compared to other users who have already joined)
    const playerWithSameName = validSession.players.find(
      (playerName) => playerName === name
    );
    if (playerWithSameName) {
      throw HTTPError(
        400,
        "Name of user entered is not unique (compared to other users who have already joined)"
      );
    }
  }

  const newPlayer: Player = {
    playerId: data.nextPlayerId,
    name: name,
    sessionJoined: sessionId,
  };

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
};

export const allChatMessages = (playerId: number) => {
  const data = getData();

  const validPlayer = data.players.find(
    (player) => player.playerId === playerId
  );
  // Error: playerId does not exist
  if (!validPlayer) {
    throw HTTPError(400, "PlayerId does not exist");
  }

  const currSession = data.quizSessions.find(
    (quizSession) => quizSession.quizSessionId === validPlayer.sessionJoined
  );

  return {
    messages: currSession.messages,
  };
};

export const sendChatMessage = (playerId: number, message: string) => {
  const data = getData();

  const validPlayer = data.players.find(
    (player) => player.playerId === playerId
  );

  // Error: playerId does not exist
  if (!validPlayer) {
    throw HTTPError(400, "PlayerId does not exist");
  }

  if (message.length < 1 || message.length > 100) {
    throw HTTPError(
      400,
      "Message body is less than 1 character or more than 100 characters"
    );
  }

  const currSession = data.quizSessions.find(
    (quizSession) => quizSession.quizSessionId === validPlayer.sessionJoined
  );
  const newMessage: Message = {
    messageBody: message,
    playerId: validPlayer.playerId,
    playerName: validPlayer.name, // Assuming the player's name is in the 'name' field
    timeSent: getCurrentTimestamp(),
  };

  currSession.messages.push(newMessage);
  setData(data);
  return {};
};

export const playerStatus = (
  playerId: number
): {
  state: string;
  numQuestions: number;
  atQuestion: number;
} => {
  const data = getData();

  // Error: Player ID does not exist
  const validPlayer = data.players.find(
    (player) => player.playerId === playerId
  );
  if (!validPlayer) {
    throw HTTPError(400, "Player ID does not exist");
  }

  const currSession = data.quizSessions.find(
    (quizSession) => quizSession.quizSessionId === validPlayer.sessionJoined
  );

  return {
    state: currSession.state,
    atQuestion: currSession.atQuestion,
    numQuestions: currSession.metadata.numQuestions,
  };
};

export const getQuestionResult = (
  playerId: number,
  questionPosition: number
): {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
} => {
  const data = getData();

  // Error: Player ID does not exist
  const validPlayer = data.players.find(
    (player) => player.playerId === playerId
  );
  if (!validPlayer) {
    throw HTTPError(400, "Player ID does not exist");
  }

  const currSession = data.quizSessions.find(
    (quizSession) => quizSession.quizSessionId === validPlayer.sessionJoined
  );

  // if question Position is not in an approriate range
  if (
    questionPosition < 1 ||
    questionPosition > currSession.metadata.numQuestions
  ) {
    throw HTTPError(
      400,
      "Question position is not valid for the session this player is in"
    );
  }

  if (currSession.state !== "ANSWER_SHOW") {
    throw HTTPError(400, "Session is not in ANSWER_SHOW state");
  }
  if (currSession.atQuestion !== questionPosition) {
    throw HTTPError(400, "Session is not yet up to this question");
  }

  const currQuestion = currSession.metadata.questions[questionPosition];
  const correctSubmission = currSession.answerSubmission.filter(
    (submission) => submission.answer.correct === true
  );
  const playersCorrectList = correctSubmission.map(
    (submission) => submission.playerName
  );

  const totalPlayers = currSession.answerSubmission.length;
  const numPlayersCorrect = playersCorrectList.length;
  const percentCorrect = Math.round((numPlayersCorrect / totalPlayers) * 100);

  const answerTimeList = currSession.answerSubmission.map(
    (submission) => submission.answerTime
  );

  const totalAnswerTime = answerTimeList.reduce(
    (accumulator, currValue) => accumulator + currValue,
    0
  );
  const averageAnswerTime = totalAnswerTime / totalPlayers;

  return {
    questionId: currQuestion.questionId,
    playersCorrectList: playersCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect,
  };
};
