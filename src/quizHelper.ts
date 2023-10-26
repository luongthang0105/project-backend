import { Colour } from './types';
import { Question } from './types';
// Helper function to check if a string contains alphanumeric characters or spaces
const alphanumericAndSpaceCheck = (str: string): boolean =>
  /^[A-Za-z\s\d]*$/.test(str);

// Helper function to get the current timestamp in seconds
const getCurrentTimestamp = (): number => Math.floor(Date.now() / 1000);

// Helper function to randomly get a colour for a question
const getQuestionColour = (): Colour => {
  const colours: Colour[] = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'brown',
    'orange',
  ];
  const randomIndex = Math.floor(Math.random() * (colours.length - 1));
  return colours[randomIndex];
};

const moveQuestion = (questions: Question[], from: number, to: number): Question[] => {
  let numOfMovedQs = 1;

  const needMoveQuestion = questions.splice(from, numOfMovedQs)[0];

  numOfMovedQs = 0;

  questions.splice(to, numOfMovedQs, needMoveQuestion);

  return questions;
};
export { alphanumericAndSpaceCheck, getCurrentTimestamp, getQuestionColour, moveQuestion };
