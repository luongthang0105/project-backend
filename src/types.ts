type token = {
  identifier: string,
  authUserId: number
}

//parameter for adminAuthRegister and adminAuthLogin
type loginInfo = {
  email: string,
  password: string,
  nameFirst?: string,
  nameLast?: string
}

//response for adminUserDetails
type userDetails = {
  user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
  }
}

//response for adminQuizList and adminQuizCreate
type quiz = {quizId: number, name?: string};
type quizList = {
  quizzes: quiz[]
}

//parameter for adminQuizCreate
type quizCreate = {
  token: string,
  name: string,
  description: string
}

type colours = 
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'brown'
  | 'orange'

type answer = {
  answerId: number,
  answer: string,
  colour: colours,
  correct: boolean
}

type question = {
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: answer[]
}

//response for adminQuizInfo
type quizInfo = {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: question[],
  duration: number,
}

//parameter for adminQuizNameUpdate
type nameUpdate = {
  token: string,
  name: string
}

//parameter for adminQuizDescriptionUpdate
type descriptionUpdate = {
  token: string,
  name: string
}


type userObject = {
  authUserId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number
  sessions: token[]
}

type quizObject = {
  quizId: number,
  name: string,
  description: string,
  timeCreated: number,
  timeLastEdited: number,
  questions: question[],
  numQuestions: number,
  duration: number
}

type dataStore = {
  users: userObject[],
  quizzes: quizObject[],
  trash: quizObject[]
  nextUserId: number,
  nextQuizId: number
}

export {
  token, 
  loginInfo, 
  userDetails, 
  quiz, 
  quizList, 
  quizCreate, 
  colours, 
  answer, 
  question, 
  quizInfo, 
  nameUpdate, 
  descriptionUpdate,
  userObject,
  quizObject,
  dataStore
}


