import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminQuizCreateQuestion,
  adminQuizDeleteQuestion,
  adminQuizList,
  adminQuizQuestionUpdate,
  adminQuizRemove,
  adminQuizViewTrash,
  adminQuizDuplicateQuestion,
  adminQuizRestore,
  adminQuizTrashEmpty,
  adminQuizTransfer,
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizMoveQuestion,
  adminQuizCreateQuestionV2,
  adminQuizInfoV2,
  adminQuizCreateV2,
  adminQuizQuestionUpdateV2,
  adminQuizDuplicateQuestionV2,
  adminQuizThumbnail,
  adminQuizDeleteQuestionV2,
  adminQuizTransferV2,
  adminQuizRemoveV2,
} from './quiz';
import {
  adminQuizSessionStart,
  adminQuizGetSessionStatus,
  adminQuizViewSessions,
  adminQuizSessionStateUpdate,
} from './session';
import { clear } from './other';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserPasswordUpdate,
  adminAuthLogout,
  adminUserDetailsUpdate,
} from './auth';
import { playerJoinSession, allChatMessages, sendChatMessage, playerStatus, getQuestionInfo } from './player';
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use(
  '/docs',
  sui.serve,
  sui.setup(YAML.parse(file), {
    swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' },
  })
);

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// ====================================================================
//  ========================= ITERATION 1 =============================
// ====================================================================

// adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  res.json(result);
});

// adminAuthLogin
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);

  res.json(result);
});

// adminUserDetails
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  res.json(adminUserDetails(token));
});

// adminQuizTrashEmpty
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const quizIds: number[] = JSON.parse(req.query.quizIds as string);

  const token = req.query.token as string;
  const result = adminQuizTrashEmpty(token, quizIds);

  res.json(result);
});

// adminQuizList
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);
  res.json(result);
});

// adminQuizCreate
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const result = adminQuizCreate(token, name, description);
  res.json(result);
});

// adminQuizRemove
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const result = adminQuizRemove(token, quizId);
  res.json(result);
});

// adminQuizViewTrash
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizViewTrash(token);

  res.json(result);
});

// adminQuizInfo
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.query.token as string;

  const result = adminQuizInfo(token, quizId);

  res.json(result);
});

// adminQuizNameUpdate
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const { token, name } = req.body;
  const result = adminQuizNameUpdate(token, quizId, name);

  res.json(result);
});

// adminQuizDescriptionUpdate
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.body.token as string;

  const description = req.body.description as string;

  const result = adminQuizDescriptionUpdate(token, quizId, description);

  res.json(result);
});

// clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  return res.json(result);
});

// ====================================================================
//  ========================= ITERATION 2 =============================
// ====================================================================

// adminAuthLogout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;

  const result = adminAuthLogout(token);
  res.json(result);
});

// adminUserDetailsUpdate
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);

  res.json(result);
});

// adminUserPasswordUpdate
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;

  const result = adminUserPasswordUpdate(token, oldPassword, newPassword);

  res.json(result);
});

// adminQuizRestore
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRestore(token, quizId);
  res.json(result);
});

// adminQuizTransferQuestion
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const { token, userEmail } = req.body;

  const result = adminQuizTransfer(quizId, token, userEmail);

  res.json(result);
});

// adminQuizCreateQuestion
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const { token, questionBody } = req.body;

  const result = adminQuizCreateQuestion(
    token,
    quizId,
    questionBody.question,
    questionBody.duration,
    questionBody.points,
    questionBody.answers
  );

  res.json(result);
});

// adminQuizQuestionUpdate
app.put(
  '/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);

    const { token, questionBody } = req.body;

    const result = adminQuizQuestionUpdate(
      token,
      quizId,
      questionId,
      questionBody.question,
      questionBody.duration,
      questionBody.points,
      questionBody.answers
    );

    res.json(result);
  }
);

// adminQuizDeleteQuestion
app.delete(
  '/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);

    const token = req.query.token as string;

    const result = adminQuizDeleteQuestion(token, quizId, questionId);

    res.json(result);
  }
);

// adminQuizMoveQuestion
app.put(
  '/v1/admin/quiz/:quizid/question/:questionid/move',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const questionId = parseInt(req.params.questionid);

    const { token, newPosition } = req.body;

    const result = adminQuizMoveQuestion(
      token,
      quizId,
      questionId,
      newPosition
    );

    res.json(result);
  }
);

// adminQuizDuplicateQuestion
app.post(
  '/v1/admin/quiz/:quizid/question/:questionid/duplicate',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const questionId = parseInt(req.params.questionid);

    const { token } = req.body;

    const result = adminQuizDuplicateQuestion(token, quizId, questionId);

    res.json(result);
  }
);

// ====================================================================
//  ========================= ITERATION 3 =============================
// ====================================================================

// getCurrentQuestionInfo
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const result = getQuestionInfo(playerId, questionPosition);
  res.json(result);
});
// sendChatMessage
app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const message = req.body.message.messageBody;
  const result = sendChatMessage(playerId, message);

  res.json(result);
});
// allChatMessages
app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  console.log('huhu', playerId);
  const result = allChatMessages(playerId);

  res.json(result);
});

// adminQuizSessionStatusUpdate V1
app.put(
  '/v1/admin/quiz/:quizid/session/:sessionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const token = req.headers.token as string;

    const sessionId = parseInt(req.params.sessionid);

    const action = req.body.action as string;

    const result = adminQuizSessionStateUpdate(
      token,
      quizId,
      sessionId,
      action
    );

    res.json(result);
  }
);

// adminQuizViewSessionStatus V1
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.headers.token as string;

  const result = adminQuizViewSessions(token, quizId);

  res.json(result);
});
// adminQuizSessionStart V1
app.post(
  '/v1/admin/quiz/:quizid/session/start',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const token = req.headers.token as string;

    const autoStartNum = req.body.autoStartNum as number;

    const result = adminQuizSessionStart(token, quizId, autoStartNum);

    res.json(result);
  }
);
// adminQuizGetSessionStatus V1
app.get(
  '/v1/admin/quiz/:quizid/session/:sessionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const token = req.headers.token as string;

    const sessionId = parseInt(req.params.sessionid);

    const result = adminQuizGetSessionStatus(token, quizId, sessionId);

    res.json(result);
  }
);

// adminQuizRemove V2
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.headers.token as string;

  const result = adminQuizRemoveV2(token, quizId);
  res.json(result);
});

// adminAuthLogout V2
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const result = adminAuthLogout(token);

  res.json(result);
});

// adminUserDetails V2
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  res.json(adminUserDetails(token));
});

// adminQuizTrashEmpty V2
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const quizIds: number[] = JSON.parse(req.query.quizIds as string);
  const token = req.headers.token as string;
  const result = adminQuizTrashEmpty(token, quizIds);

  res.json(result);
});

// adminQuizRestore V2
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRestore(token, quizId);
  res.json(result);
});

// adminQuizViewTrash V2
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const result = adminQuizViewTrash(token);

  res.json(result);
});

// adminQuizDescriptionUpdate V2
app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.headers.token as string;

  const description = req.body.description as string;

  const result = adminQuizDescriptionUpdate(token, quizId, description);

  res.json(result);
});
// adminUserPasswordUpdate V2
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const { oldPassword, newPassword } = req.body;

  const result = adminUserPasswordUpdate(token, oldPassword, newPassword);

  res.json(result);
});

// adminQuizMoveQuestion V2
app.put(
  '/v2/admin/quiz/:quizid/question/:questionid/move',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const questionId = parseInt(req.params.questionid);

    const token = req.headers.token as string;

    const { newPosition } = req.body;

    const result = adminQuizMoveQuestion(
      token,
      quizId,
      questionId,
      newPosition
    );

    res.json(result);
  }
);

// adminQuizDuplicateQuestion V2
app.post(
  '/v2/admin/quiz/:quizid/question/:questionid/duplicate',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const questionId = parseInt(req.params.questionid);

    const token = req.headers.token as string;

    const result = adminQuizDuplicateQuestionV2(token, quizId, questionId);

    res.json(result);
  }
);

// adminQuizList V2
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const result = adminQuizList(token);

  res.json(result);
});

// adminQuizCreate V2
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const { name, description } = req.body;

  const result = adminQuizCreateV2(token, name, description);

  res.json(result);
});

// adminQuizNameUpdate V2
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.headers.token as string;

  const { name } = req.body;

  const result = adminQuizNameUpdate(token, quizId, name);

  res.json(result);
});

// adminQuizCreateQuestion V2
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const { questionBody } = req.body;

  const token = req.headers.token as string;

  const result = adminQuizCreateQuestionV2(
    token,
    quizId,
    questionBody.question,
    questionBody.duration,
    questionBody.points,
    questionBody.answers,
    questionBody.thumbnailUrl
  );
  res.json(result);
});

// adminQuizInfo V2
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.headers.token as string;

  const result = adminQuizInfoV2(token, quizId);

  res.json(result);
});

// adminUserDetailsUpdate V2
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const { email, nameFirst, nameLast } = req.body;

  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);

  res.json(result);
});

// adminQuizTransfer V2
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.headers.token as string;

  const { userEmail } = req.body;

  const result = adminQuizTransferV2(quizId, token, userEmail);

  res.json(result);
});

// adminQuizDeleteQuestion V2

app.delete(
  '/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);

    const questionId = parseInt(req.params.questionid);

    const token = req.headers.token as string;

    const result = adminQuizDeleteQuestionV2(token, quizId, questionId);

    res.json(result);
  }
);

// adminQuizQuestionUpdate V2
app.put(
  '/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const token = req.headers.token as string;

    const { questionBody } = req.body;

    const result = adminQuizQuestionUpdateV2(
      token,
      quizId,
      questionId,
      questionBody.question,
      questionBody.duration,
      questionBody.points,
      questionBody.answers,
      questionBody.thumbnailUrl
    );

    res.json(result);
  }
);

// adminQuizThumbnail V1
app.put(
  '/v1/admin/quiz/:quizid/thumbnail',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const token = req.headers.token as string;

    const { imgUrl } = req.body;

    const result = adminQuizThumbnail(
      token,
      quizId,
      imgUrl
    );

    res.json(result);
  }
);

// playerJoinSession V1
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;

  const result = playerJoinSession(sessionId, name);

  res.json(result);
}
);

// playerStatus V1
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerid);

  const result = playerStatus(playerId);

  res.json(result);
}
);

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================
app.use((req: Request, res: Response) => {
  const error = `
    404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
