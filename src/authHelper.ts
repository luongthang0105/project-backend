import { DataStore } from './types';

/**
 * Check if the given email address is already used by any user in the data store.
 *
 * @param newEmail - The email address to check.
 * @param data - The data store containing user information.
 *
 * @returns `true` if the email address is already in use, `false` otherwise.
 */
const emailUsed = (newEmail: string, data: DataStore): boolean => {
  for (const user of data.users) {
    if (user.email === newEmail) {
      return true;
    }
  }
  return false;
};

/**
 * Check if the given name is valid based on specific criteria.
 *
 * @param name - The name to check.
 *
 * @returns `true` if the name is valid, `false` otherwise.
 */
const validName = (name: string): boolean => {
  for (const character of name) {
    // character is an alphabetic character
    if (character.toLowerCase() !== character.toUpperCase()) continue;

    // character is spaces
    if (character === ' ') continue;

    // character is hyphen
    if (character === '-') continue;

    // character is apostrophe
    if (character === "'") continue;

    return false;
  }

  return true;
};

/**
 * Check if the given password is secure based on specific criteria.
 *
 * @param password - The password to check.
 *
 * @returns `true` if the password is secure, `false` otherwise.
 */
const securedPassword = (password: string): boolean => {
  let hasLetter = false;
  let hasNumber = false;

  for (const character of password) {
    // if character is letter
    if (character.toLowerCase() !== character.toUpperCase()) {
      hasLetter = true;
    }

    // if character is a number (note that isNaN returns false when character is a space so we need to exclude this case)
    if (!isNaN(Number(character)) && character !== ' ') {
      hasNumber = true;
    }
  }

  return hasLetter && hasNumber;
};

export { validName, securedPassword, emailUsed };
