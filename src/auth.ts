import { getData, setData } from './dataStore';
import validator from 'validator';
import { emailUsed, validName, securedPassword } from './authHelper';
import { EmptyObject, ErrorObject, ReturnedToken, Token, UserDetails, UserObject } from './types';

/**
 * Registers a user with an email, password, first name, and last name, then returns their authUserId value.
 *
 * @param {string} email - The email address of the user to be registered.
 * @param {string} password - The password for the user account.
 * @param {string} nameFirst - The user's first name.
 * @param {string} nameLast - The user's last name.
 * @returns {{authUserId: number} | { error: string }}
 * - An object containing the authUserId of the registered user if registration is successful.
 *   If any validation errors occur, it returns an error object with a message.
 */
const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): ReturnedToken | ErrorObject => {
  // Retrieve the current data
  const data = getData();

  // Check if the email address is used by another user
  if (emailUsed(email, data)) {
    return {
      statusCode: 400,
      error: 'Email address used by another user',
    };
  }

  // Check if the email address is valid
  if (!validator.isEmail(email)) {
    return {
      error: 'Invalid email address',
      statusCode: 400
    };
  }

  // Check if the first name is valid
  if (!validName(nameFirst)) {
    return {
      error:
        'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
      statusCode: 400
    };
  }

  // Check the length of the first name
  if (nameFirst.length > 20 || nameFirst.length < 2) {
    return {
      error: 'First name length must be between 2 and 20 characters',
      statusCode: 400
    };
  }

  // Check if the last name is valid
  if (!validName(nameLast)) {
    return {
      error:
        'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
      statusCode: 400
    };
  }

  // Check the length of the last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    return {
      statusCode: 400,
      error: 'Last name length must be between 2 and 20 characters',
    };
  }

  // Check the length of the password
  if (password.length < 8) {
    return {
      error: 'Password must have at least 8 characters',
      statusCode: 400
    };
  }

  // Check if the password contains at least one number and one letter
  if (!securedPassword(password)) {
    return {
      error:
        'Password must contain at least one number and at least one letter',
      statusCode: 400
    };
  }

  // Create a new user object
  const user = {
    authUserId: data.nextUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  // Add the new user to the data
  data.users.push(user);
  data.nextUserId += 1;

  const newToken: Token = {
    identifier: (data.nextTokenId).toString(),
    authUserId: user.authUserId
  };

  data.sessions.push(newToken);
  data.nextTokenId += 1;

  // update dataStore by calling setData which will save it to data.json
  setData(data);

  // Return an object containing the authUserId of the registered user
  return { token: newToken.identifier };
};

/**
 * Given a registered user's email and password, returns their authUserId value upon successful login.
 *
 * @param {string} email - The email address of the user attempting to log in.
 * @param {string} password - The password provided by the user for authentication.
 * @returns {{authUserId: number,} | { error: string }}
 * - An object containing the authUserId of the user upon successful login.
 *   If the email does not exist, the password is incorrect, or other errors occur,
 *   it returns an error object with a message.
 */
const adminAuthLogin = (
  email: string,
  password: string
): ReturnedToken | ErrorObject => {
  // Retrieve the current data
  const data = getData();

  // Find user information based on the provided email
  const userInfo = data.users.find((user) => user.email === email);

  // If the email does not exist in the database, return an error
  if (!userInfo) {
    return { statusCode: 400, error: 'Email adress does not exist' };
  }

  // Check if the provided password matches the stored password
  if (userInfo.password !== password) {
    // Increment the count of failed login attempts
    userInfo.numFailedPasswordsSinceLastLogin += 1;

    setData(data);
    return { statusCode: 400, error: 'Password is not correct for the given email' };
  }
  // Reset the count of failed login attempts and update the count of successful logins
  userInfo.numFailedPasswordsSinceLastLogin = 0;
  userInfo.numSuccessfulLogins += 1;

  // If all credentials are valid, give this user another session:
  const newToken: Token = {
    identifier: data.nextTokenId.toString(),
    authUserId: userInfo.authUserId
  };
  data.nextTokenId += 1;
  data.sessions.push(newToken);

  // update dataStore by calling setData which will save it to dataStore.json
  setData(data);

  // Return an object containing the authUserId of the authenticated user
  return {
    token: newToken.identifier
  };
};

/**
 * Given an admin user's authUserId, returns details about the user.
 *
 * @param {number} authUserId - The authUserId of the admin user whose details are requested.
 * @returns {
 * {
 *   user: {
 *     userId: number,
 *     name: string,
 *     email: string,
 *     numSuccessfulLogins: number,
 *     numFailedPasswordsSinceLastLogin: number,
 *   },
 * } | { error: string }
 * }
 *   - An object containing details about the admin user if the authUserId is valid.
 *     If the authUserId is not valid, it returns an error object with a message.
 */
const adminUserDetails = (token: string): UserDetails | ErrorObject => {
  // Retrieve the current data
  const data = getData();

  // Find user information based on the provided authUserId
  const session = data.sessions.find((currSession) => currSession.identifier === token);
  console.log(token);
  // If token is empty or no session with given token is found
  if (token === '' || !session) {
    return { statusCode: 401, error: 'Token is empty or invalid (does not refer to valid logged in user session)' };
  }

  const userInfo = data.users.find((user) => user.authUserId === session.authUserId) as UserObject;

  // Concatenate the first name and last name to form the full name
  const fullname = userInfo.nameFirst.concat(' ', userInfo.nameLast);

  // Return an object containing details about the admin user
  return {
    user: {
      userId: userInfo.authUserId,
      name: fullname,
      email: userInfo.email,
      numSuccessfulLogins: userInfo.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin:
        userInfo.numFailedPasswordsSinceLastLogin,
    },
  };
};


export { adminAuthRegister, adminAuthLogin, adminUserDetails };
