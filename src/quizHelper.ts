import { Colour } from './types';
import { Question } from './types';

/**
 * Checks if a string consists of alphanumeric characters (letters and digits) and spaces only.
 *
 * @param str - The string to be checked.
 * @returns True if the string contains only alphanumeric characters and spaces, false otherwise.
 */
const alphanumericAndSpaceCheck = (str: string): boolean =>
  /^[A-Za-z\s\d]*$/.test(str);

/**
 * Returns the current timestamp in seconds since the Unix epoch.
 *
 * @returns The current timestamp as a number (integer) representing seconds.
 */
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

/**
 * Moves a question within an array of questions from one index to another.
 *
 * @param questions - The array of questions.
 * @param from - The index from which the question should be moved.
 * @param to - The index to which the question should be moved.
 * @returns A new array of questions with the question moved to the specified index.
 */
const moveQuestion = (questions: Question[], from: number, to: number): Question[] => {
  let numOfMovedQs = 1;

  const needMoveQuestion = questions.splice(from, numOfMovedQs)[0];

  numOfMovedQs = 0;

  questions.splice(to, numOfMovedQs, needMoveQuestion);

  return questions;
};

export { alphanumericAndSpaceCheck, getCurrentTimestamp, getQuestionColour, moveQuestion };
