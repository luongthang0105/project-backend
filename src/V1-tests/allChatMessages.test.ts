import { adminQuizCreate, adminQuizCreateQuestion } from '../testWrappersV2';
import {
  adminAuthRegister,
  adminQuizSessionStart,
  clear,
  playerJoinSession,
  allChatMessages,
  sendChatMessage
} from '../testWrappersV1';
import { Quiz, ReturnedToken } from '../types';
import { expect, test } from '@jest/globals';

describe('allChatMessages', () => {
  let user1: ReturnedToken;
  let quiz1: Quiz;
  let questInfo1;
  let question1;
  let session1: number;
  let player1: number;
  beforeEach(() => {
    clear();
    user1 = adminAuthRegister(
      'sasaki@gmai.com',
      '2705uwuwuwuwuwuw',
      'Mutsuki',
      'Sasaki'
    ).content as ReturnedToken;
    quiz1 = adminQuizCreate(user1, 'Hihihihihih', 'This is my quiz')
      .content as Quiz;
    questInfo1 = {
      question: 'What is that pokemon',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Pikachu',
          correct: true,
        },
        {
          answer: 'Thomas',
          correct: false,
        },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    question1 = adminQuizCreateQuestion(
      user1,
      quiz1.quizId,
      questInfo1.question,
      questInfo1.duration,
      questInfo1.points,
      questInfo1.answers,
      questInfo1.thumbnailUrl
    ).content.questionId;
    expect(question1).toStrictEqual(expect.any(Number));
    session1 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;
    player1 = playerJoinSession(session1, 'Thomas').content.playerId;
  });

  test('Error: PlayerId does not exist', () => {
    const result = allChatMessages(player1 + 1);

    expect(result).toStrictEqual({
      content: {
        error: 'PlayerId does not exist',
      },
      statusCode: 400,
    });
  });

  test('Success: Return all chat messages in current session: have 1 session', () => {
    const player2 = playerJoinSession(session1, 'Eren Yeager').content.playerId;
    sendChatMessage(player2, 'Hello everyone! Nice to chat.');
    sendChatMessage(player1, 'Hello Eren!');
    sendChatMessage(player2, 'Hello Mikasa!');

    const messages = allChatMessages(player1);
    expect(messages).toStrictEqual({
      content: {
        messages: [
          {
            messageBody: 'Hello everyone! Nice to chat.',
            playerId: player2,
            playerName: 'Eren Yeager',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'Hello Eren!',
            playerId: player1,
            playerName: 'Thomas',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'Hello Mikasa!',
            playerId: player2,
            playerName: 'Eren Yeager',
            timeSent: expect.any(Number),
          },
        ],
      },
      statusCode: 200,
    });
  });

  test('Successful: Return all chat messages in current session: have 2 session', () => {
    const session2 = adminQuizSessionStart(user1, quiz1.quizId, 3).content.sessionId;

    const player2 = playerJoinSession(session1, 'Eren Yeager').content.playerId;
    const player3 = playerJoinSession(session2, 'Reiner').content.playerId;

    sendChatMessage(player3, "Hello I'm Reiner");
    sendChatMessage(player2, 'Hello everyone! Nice to chat.');
    sendChatMessage(player1, 'Hello Eren!');
    sendChatMessage(player2, 'Hello Mikasa!');

    const messages1 = allChatMessages(player1);
    expect(messages1).toStrictEqual({
      content: {
        messages: [
          {
            messageBody: 'Hello everyone! Nice to chat.',
            playerId: player2,
            playerName: 'Eren Yeager',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'Hello Eren!',
            playerId: player1,
            playerName: 'Thomas',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'Hello Mikasa!',
            playerId: player2,
            playerName: 'Eren Yeager',
            timeSent: expect.any(Number),
          },
        ],
      },
      statusCode: 200,
    });

    const messages2 = allChatMessages(player3);
    expect(messages2).toStrictEqual({
      content: {
        messages: [
          {
            messageBody: "Hello I'm Reiner",
            playerId: player3,
            playerName: 'Reiner',
            timeSent: expect.any(Number),
          },
        ],
      },
      statusCode: 200,
    });
  });
});
