type ErrorObject = {
  statusCode?: number,
  error: string
}

// Typescript recommends assigning Record<string, never> instead of {}
type EmptyObject = Record<string, never>

// The Token type we use to store sessions in data.json
type Token = {
  identifier: string,
  authUserId: number
}

// The token type we received from adminAuthRegister and adminAuthLogin (as well as their routes)
type ReturnedToken = {
  token: string
}

// parameter for adminAuthRegister and adminAuthLogin
type LoginInfo = {
  email: string,
  password: string,
  nameFirst?: string,
  nameLast?: string
}

// response for adminUserDetails
type UserDetails = {
  user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
  }
}

// response for adminQuizList and adminQuizCreate
type Quiz = {quizId: number, name?: string};
type QuizList = {
  quizzes: Quiz[]
}

// parameter for adminQuizCreate
type QuizCreate = {
  token: string,
  name: string,
  description: string
}

type Colour =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'brown'
  | 'orange'

type Answer = {
  answerId?: number,
  answer: string,
  colour?: Colour,
  correct: boolean
}

type Question = {
  questionId?: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
}

// parameter for adminQuizNameUpdate
type NameUpdate = {
  token: string,
  name: string
}

// parameter for adminQuizDescriptionUpdate
type DescriptionUpdate = {
  token: string,
  name: string
}

type UserObject = {
  authUserId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string
  usedPasswords: string[]
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
}

type QuizObject = {
  quizId: number,
  quizAuthorId?: number,
  name: string,
  description: string,
  timeCreated: number,
  timeLastEdited: number,
  questions: Question[],
  numQuestions: number,
  duration: number
}

type DataStore = {
  users: UserObject[],
  quizzes: QuizObject[],
  trash: QuizObject[],
  sessions: Token[],
  nextTokenId: number,
  nextUserId: number,
  nextQuizId: number,
  nextQuestionId: number,
  nextAnswerId: number
}

export {
  EmptyObject,
  ErrorObject,
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
  DataStore
};
