import { getData } from './dataStore';
import { Answer, Colour } from './types';
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
const moveQuestion = (
  questions: Question[],
  from: number,
  to: number
): Question[] => {
  let numOfMovedQs = 1;

  const needMoveQuestion = questions.splice(from, numOfMovedQs)[0];

  numOfMovedQs = 0;

  questions.splice(to, numOfMovedQs, needMoveQuestion);

  return questions;
};

/**
 * Determine whether a set of answers has duplicated answers in it.
 * Answers are considered the same if they have the same answer string.
 *
 * @param answers - The array of answers.
 * @returns True if there exists duplicated answers, False otherwise
 */
const hasDuplicatedAnswers = (answers: Answer[]): boolean => {
  // We iterate through each answer object by calling .filter()
  const duplicateAnswers = answers.filter((currAnswer, currAnswerIndex) =>
    // If we can find another answer object that has different index but same "answer" string,
    // then add that object to the result array
    answers.find(
      (otherAnswer, otherAnswerIndex) =>
        otherAnswer.answer === currAnswer.answer &&
        otherAnswerIndex !== currAnswerIndex
    )
  );
  return duplicateAnswers.length !== 0;
};

/**
 * Determine whether a set of answers has duplicated answers in it.
 * Answers are considered the same if they have the same answer string.
 *
 * @param answers - The array of answers.
 * @returns True if there exists duplicated answers, False otherwise
 */
const newAnswerList = (answers: Answer[]): Answer[] => {
  const data = getData();

  return answers.map((currAnswer) => {
    const newAnswerId = data.nextAnswerId;
    data.nextAnswerId += 1;
    return {
      answerId: newAnswerId,
      answer: currAnswer.answer,
      colour: getQuestionColour(),
      correct: currAnswer.correct,
    };
  });
};

/**
 * Determine whether the given url string ends with the file type jpg, jpeg, or png
 *
 * @param url - The url string.
 * @returns True if the url ends with one of the filetypes jpg, jpeg, or png. False otherwise
 */
const isUrlEndWithImgExtension = (url: string): boolean => {
  // Since the comparison is case-insensitive, we need to normalize the given string by lowercase-ing it
  url = url.toLowerCase();

  if (!url.endsWith('.jpg') &&
      !url.endsWith('.jpeg') &&
      !url.endsWith('.png')) {
    return false;
  }

  return true;
};

/**
 * Determine whether the given url string starts with 'http://' or 'https://'
 *
 * @param url - The url string.
 * @returns True if the url starts with 'http://' or 'https://'. False otherwise
 */
const isUrlStartWithHTTP = (url: string): boolean => {
  // Since the comparison is case-insensitive, we need to normalize the given string by lowercase-ing it
  url = url.toLowerCase();

  if (!url.startsWith('http://') &&
      !url.startsWith('https://')) {
    return false;
  }

  return true;
};

export {
  alphanumericAndSpaceCheck,
  getCurrentTimestamp,
  getQuestionColour,
  moveQuestion,
  hasDuplicatedAnswers,
  newAnswerList,
  isUrlEndWithImgExtension,
  isUrlStartWithHTTP
};
