import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { areAnswersTheSame, generateRandomName } from './playerHelper';
import { Player, Message, EmptyObject } from './types';
import { toQuestionCountDownState } from './sessionHelper';
import { getCurrentTimestamp } from './quizHelper';

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
      'Session doesnt exist (this is undefined behaviour and wont be tested)'
    );
  }

  // Error: Session is not in LOBBY state
  if (validSession.state !== 'LOBBY') {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  // If name is empty, randomly generate it according to the structure [5 letters][3 numbers],
  // where there are no repetitions of numbers or characters within the same name
  if (name === '') {
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
        'Name of user entered is not unique (compared to other users who have already joined)'
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
    throw HTTPError(400, 'PlayerId does not exist');
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
    throw HTTPError(400, 'PlayerId does not exist');
  }

  if (message.length < 1 || message.length > 100) {
    throw HTTPError(
      400,
      'Message body is less than 1 character or more than 100 characters'
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
  state: string
  numQuestions: number
  atQuestion: number
} => {
  const data = getData();

  // Error: Player ID does not exist
  const validPlayer = data.players.find(
    (player) => player.playerId === playerId
  );
  if (!validPlayer) {
    throw HTTPError(400, 'Player ID does not exist');
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

export const playerSubmission = (
  answerIds: number[],
  playerId: number,
  questionPosition: number
): EmptyObject => {
  const data = getData();

  // Error: Player ID does not exist
  const validPlayer = data.players.find(
    (player) => player.playerId === playerId
  );
  if (!validPlayer) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  const sessionJoined = data.quizSessions.find(
    (quizSession) => quizSession.quizSessionId === validPlayer.sessionJoined
  );

  // Error: If question position is not valid for the session this player is in
  if (
    questionPosition <= 0 ||
    questionPosition > sessionJoined.metadata.numQuestions
  ) {
    throw HTTPError(
      400,
      'Question position is not valid for the session this player is in'
    );
  }

  // Error: Session is not in QUESTION_OPEN state
  if (sessionJoined.state !== 'QUESTION_OPEN') {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  // Error: If session is not yet up to this question
  if (questionPosition !== sessionJoined.atQuestion) {
    throw HTTPError(400, 'If session is not yet up to this question');
  }

  // Error: Answer IDs are not valid for this particular question
  const currentQuestion = sessionJoined.metadata.questions[questionPosition - 1];
  const allAnswers = currentQuestion.answers;

  if (
    // If we find an answerId that does not exist in the allAnswers array, then
    // its not valid
    answerIds.find(
      (answerId) =>
        // Check if it exists in the allAnswers array. Returns True if it does not.
        !allAnswers.find((validAnswer) => validAnswer.answerId === answerId)
    )
  ) {
    throw HTTPError(
      400,
      'Answer IDs are not valid for this particular question'
    );
  }

  // Error: There are duplicate answer IDs provided
  if (answerIds.length !== new Set(answerIds).size) {
    throw HTTPError(400, 'There are duplicate answer IDs provided');
  }

  // Error: Less than 1 answer ID was submitted
  if (answerIds.length === 0) {
    throw HTTPError(400, 'Less than 1 answer ID was submitted');
  }

  const playerName = validPlayer.name;
  const questionId = sessionJoined.metadata.questions[questionPosition - 1].questionId;

  // Check if this player has submitted an answer already
  const submittedAnswerFromPlayer = sessionJoined.answerSubmitted.find(
    (answer) => answer.playerName === playerName && answer.questionId === questionId
  );
  // If already submitted, delete that answer and submit this one instead
  if (submittedAnswerFromPlayer) {
    const indexOfAnswer = sessionJoined.answerSubmitted.indexOf(submittedAnswerFromPlayer);
    sessionJoined.answerSubmitted.splice(indexOfAnswer);
  }

  const currTime = getCurrentTimestamp();
  const answerTime = currTime - sessionJoined.timeQuestionOpened;

  // Now we need to extract correct answerIds from allAnswers
  const correctAnswerIds = allAnswers
    .filter((answer) => answer.correct)
    .map((answer) => answer.answerId);

  // Check if the correctAnswers array is the same as player answerIds
  const correct = areAnswersTheSame(answerIds, correctAnswerIds);

  sessionJoined.answerSubmitted.push({
    questionId: questionId,
    playerName: playerName,
    answerTime: answerTime,
    correct: correct
  });

  setData(data);
  return {};
};
