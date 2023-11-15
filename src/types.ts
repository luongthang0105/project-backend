
/**
 * Represents an empty object with no properties.
 */
type EmptyObject = Record<string, never>;

/**
 * Represents a session token used for storing user sessions in data.json.
 * @property identifier - A unique identifier for the session token.
 * @property authUserId - The user's authentication user ID associated with the session.
 */
type Token = {
  identifier: string;
  authUserId: number;
};

/**
 * Represents the token type returned by the adminAuthRegister and adminAuthLogin processes
 * and their associated routes.
 * @property token - A string containing the authentication token received upon successful registration or login.
 */
type ReturnedToken = {
  token: string;
};

/**
 * Represents the parameter type used for adminAuthRegister and adminAuthLogin functions.
 * @property email - The email address associated with the user account.
 * @property password - The user's password for authentication.
 * @property nameFirst - (Optional) The user's first name, used during registration.
 * @property nameLast - (Optional) The user's last name, used during registration.
 */
type LoginInfo = {
  email: string;
  password: string;
  nameFirst?: string;
  nameLast?: string;
};

/**
 * Represents the return type for the adminUserDetails function, providing detailed user information.
 * @property user - An object containing user details, including user ID, name, email, login statistics, etc.
 *   @property userId - The unique identifier for the user.
 *   @property name - The user's name.
 *   @property email - The user's email address.
 *   @property numSuccessfulLogins - The number of successful logins for the user.
 *   @property numFailedPasswordsSinceLastLogin - The count of failed login attempts since the last successful login.
 */
type UserDetails = {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
};

/**
 * Represents a quiz object, used in the QuizList type.
 * @property quizId - The unique identifier for the quiz.
 * @property name - (Optional) The name or title of the quiz.
 */
type Quiz = { quizId: number; name?: string };

/**
 * Represents the return type for the adminQuizList functions, providing information about quizzes.
 * @property quizzes - An array of quizzes, each represented by the Quiz type.
 *   @property quizId - The unique identifier for the quiz.
 *   @property name - (Optional) The name or title of the quiz.
 */
type QuizList = {
  quizzes: Quiz[];
};

/**
 * Represents the parameter type used for the adminQuizCreate function, specifying quiz creation details.
 * @property token - The authentication token for authorization.
 * @property name - The name or title of the quiz to be created.
 * @property description - A brief description of the quiz.
 */
type QuizCreate = {
  token: string;
  name: string;
  description: string;
};

/**
 * Represents a color selection with predefined options.
 */
type Colour =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'brown'
  | 'orange';

/**
 * Represents an answer option in a quiz question.
 * @property answerId - (Optional) The unique identifier for the answer.
 * @property answer - The text content of the answer option.
 * @property colour - (Optional) The color associated with the answer, if applicable, chosen from a predefined set of colours.
 * @property correct - A boolean indicating whether this answer is correct or not.
 */
type Answer = {
  answerId?: number;
  answer: string;
  colour?: Colour;
  correct: boolean;
};

/**
 * Represents a quiz question with its associated properties.
 * @property questionId - (Optional) The unique identifier for the question.
 * @property question - The text content of the question itself.
 * @property duration - The time limit in seconds for answering the question.
 * @property points - The number of points awarded for a correct answer to this question.
 * @property answers - An array of Answer objects representing answer options for the question.
 */
type Question = {
  questionId?: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];

  // let this field be optional since we need backwards compatibility with It2
  thumbnailUrl?: string
};

/**
 * Represents the parameter type used for updating a quiz's name in adminQuizNameUpdate.
 * @property token - The authentication token for authorization.
 * @property name - The new name for the quiz.
 */
type NameUpdate = {
  token: string;
  name: string;
};

/**
 * Represents the parameter type used for updating a quiz's description in adminQuizDescriptionUpdate.
 * @property token - The authentication token for authorization.
 * @property name - The new description for the quiz.
 */
type DescriptionUpdate = {
  token: string;
  name: string;
};

/**
 * Represents a user object with user-related properties.
 */
type UserObject = {
  authUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  usedPasswords: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
};

/**
 * Represents a quiz object with quiz-related properties.
 */
type QuizObject = {
  quizId: number;
  quizAuthorId?: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  questions: Question[];
  numQuestions: number;
  duration: number;

  // let this field be optional since we need backwards compatibility with It2
  thumbnailUrl?: string
};

type Message = {
  messageBody: string,
  playerId: number,
  playerName: string,
  timeSent: number
}

type Player = {
  playerId: number,
  name: string,
  sessionJoined: number
}

/**
 * Represents the data store structure with arrays of users, quizzes, sessions, and counters.
 */
type DataStore = {
  users: UserObject[];
  quizzes: QuizObject[];
  trash: QuizObject[];
  sessions: Token[];
  quizSessions: QuizSession[];
  players: Player[],
  nextUserId: number;
  nextQuizId: number;
  nextQuestionId: number;
  nextAnswerId: number;
  nextQuizSessionId: number;
  nextPlayerId: number
};

/**
 * States a quiz session can be in
 */
type SessionState =
  | 'LOBBY'
  | 'QUESTION_COUNTDOWN'
  | 'QUESTION_OPEN'
  | 'QUESTION_CLOSE'
  | 'ANSWER_SHOW'
  | 'FINAL_RESULTS'
  | 'END'

/**
 * 4 key actions that an admin can send to moves us between states
 */
  type AdminAction =
  | 'NEXT_QUESTION'
  | 'SKIP_COUNTDOWN'
  | 'GO_TO_ANSWER'
  | 'GO_TO_FINAL_RESULTS'
  | 'END'
type Submission = {
  questionId: number,
  playerName: string,
  answerTime: number,
  answer: number[]
}
/**
 * Represents the structure of quiz sessions which describe a particular instance of a quiz being run
 */
  type QuizSession = {
    quizSessionId?: number,
    autoStartNum?: number,
    state: SessionState,
    atQuestion: number,
    players: string[],
    metadata: QuizObject,
    messages: Message[],
    answerSubmitted: Submission[]
  }

export {
  EmptyObject,
  Token,
  ReturnedToken,
  LoginInfo,
  UserDetails,
  Quiz,
  QuizList,
  QuizCreate,
  Colour,
  Answer,
  Question,
  NameUpdate,
  DescriptionUpdate,
  UserObject,
  QuizObject,
  DataStore,
  SessionState,
  AdminAction,
  QuizSession,
  Player,
  Message
};
