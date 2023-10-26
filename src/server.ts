import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { adminQuizCreateQuestion, adminQuizDeleteQuestion, adminQuizList, adminQuizQuestionUpdate, adminQuizRemove, adminQuizViewTrash } from './quiz';
import { clear } from './other';
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminAuthLogout } from './auth';
import {
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizMoveQuestion,
  adminQuizRestore
} from './quiz';

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
  const ret = echo(data);
  if ('error' in ret) {
    res.status(400);
  }
  return res.json(ret);
});

// adminQuizRemove
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const result = adminQuizRemove(token, quizId);
  if ('error' in result) {
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }
  res.json(result);
});

// adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in result) {
    // In this case result has type ErrorObject so it looks like this: { error: string, statusCode: number }.
    // We need to return {error: string} according to the spec, so we need to format it like this: {error: result.error}
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

// adminAuthLogin
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);

  if ('error' in result) {
    // In this case result has type ErrorObject so it looks like this: { error: string, statusCode: number }.
    // We need to return {error: string} according to the spec, so we need to format it like this: {error: result.error}
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

// adminUserDetails
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);

  if ('error' in result) {
    // In this case result has type ErrorObject so it looks like this: { error: string, statusCode: number }.
    // We need to return {error: string} according to the spec, so we need to format it like this: {error: result.error}
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);

  if ('error' in result) {
    // In this case result has type ErrorObject so it looks like this: { error: string, statusCode: number }.
    // We need to return {error: string} according to the spec, so we need to format it like this: {error: result.error}
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

// clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  return res.json(result);
});

// adminQuizDescriptionUpdate
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.body.token as string;

  const description = req.body.description as string;

  const result = adminQuizDescriptionUpdate(token, quizId, description);

  if ('error' in result) {
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

// adminQuizVewTrash
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizViewTrash(token);

  console.log(result);
  if ('error' in result) {
    // In this case result has type ErrorObject so it looks like this: { error: string, statusCode: number }.
    // We need to return {error: string} according to the spec, so we need to format it like this: {error: result.error}
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

// adminQuizNameUpdate
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const { token, name } = req.body;
  const result = adminQuizNameUpdate(token, quizId, name);

  if ('error' in result) {
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

// adminQuizRestore
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRestore(token, quizId);
  if ('error' in result) {
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }
  res.json(result);
});

// adminQuizCreate
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const result = adminQuizCreate(token, name, description);

  if ('error' in result) {
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }
  res.json(result);
});

// adminQuizInfo
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.query.token as string;

  const result = adminQuizInfo(token, quizId);

  if ('error' in result) {
    res.status(result.statusCode as number).json({ error: result.error });
    return;
  }

  res.json(result);
});

// clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  return res.json(result);
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

  if ('error' in result) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }

  res.json(result);
});

app.post('/v1/admin/logout', (req: Request, res: Response) => {
  const { token } = req.body;

  const result = adminAuthLogout(token)

  if ('error' in result) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }
  res.json(result);
})

// adminQuizQuestionUpdate
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
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

  if ('error' in result) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }

  res.json(result);
});

// adminQuizDeleteQuestion
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  const token = req.query.token as string;

  const result = adminQuizDeleteQuestion(
    token,
    quizId,
    questionId
  );

  if ('error' in result) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }

  res.json(result);
});

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

    if ('error' in result) {
      res.status(result.statusCode).json({ error: result.error });
      return;
    }

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

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);

  // Add a data.json file as database
  clear();
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
