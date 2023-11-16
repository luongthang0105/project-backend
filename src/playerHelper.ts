import randomstring from 'randomstring';

export const generateRandomName = (): string => {
  let finalName = '';

  // Generate a unique 5 letters string
  while (true) {
    const randomString = randomstring.generate({
      length: 5,
      charset: 'alphabetic'
    });

    if ((new Set(randomString.split(''))).size === 5) {
      finalName += randomString;
      break;
    }
  }

  // Generate a unique 3 numbers string
  while (true) {
    const randomString = randomstring.generate({
      length: 3,
      charset: 'numeric'
    });

    if ((new Set(randomString.split(''))).size === 3) {
      finalName += randomString;
      break;
    }
  }

  return finalName;
};

export const areAnswersTheSame = (answerIds1: number[], answerIds2: number[]): boolean => {
  return JSON.stringify(new Set(answerIds1)) === JSON.stringify(new Set(answerIds2));
}