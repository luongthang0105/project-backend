import { getData, setData } from './dataStore';
import validator from 'validator';
import { emailUsed, validName, securedPassword } from './authHelper';
import { ReturnedToken, Token, UserDetails, UserObject, EmptyObject } from './types';
import HTTPError from 'http-errors';

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
): ReturnedToken => {
  // Retrieve the current data
  const data = getData();

  // Check if the email address is used by another user
  if (emailUsed(email, data)) {
    throw HTTPError(400, 'Email address used by another user');
  }

  // Check if the email address is valid
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email address');
  }

  // Check if the first name is valid
  if (!validName(nameFirst)) {
    throw HTTPError(400, 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes');
  }

  // Check the length of the first name
  if (nameFirst.length > 20 || nameFirst.length < 2) {
    throw HTTPError(400, 'First name length must be between 2 and 20 characters');
  }

  // Check if the last name is valid
  if (!validName(nameLast)) {
    throw HTTPError(400, 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes');
  }

  // Check the length of the last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    throw HTTPError(400, 'Last name length must be between 2 and 20 characters');
  }

  // Check the length of the password
  if (password.length < 8) {
    throw HTTPError(400, 'Password must have at least 8 characters');
  }

  // Check if the password contains at least one number and one letter
  if (!securedPassword(password)) {
    throw HTTPError(400, 'Password must contain at least one number and at least one letter');
  }

  // Create a new user object
  const user = {
    authUserId: data.nextUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    usedPasswords: [] as string[],
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  // Add the new user to the data
  data.users.push(user);
  data.nextUserId += 1;

  const newToken: Token = {
    identifier: data.nextTokenId.toString(),
    authUserId: user.authUserId,
  };

  data.sessions.push(newToken);
  data.nextTokenId += 1;

  // Update dataStore by calling setData which will save it to data.json
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
): ReturnedToken => {
  // Retrieve the current data
  const data = getData();

  // Find user information based on the provided email
  const userInfo = data.users.find((user) => user.email === email);

  // If the email does not exist in the database, return an error
  if (!userInfo) {
    throw HTTPError(400, 'Email adress does not exist');
  }

  // Check if the provided password matches the stored password
  if (userInfo.password !== password) {
    // Increment the count of failed login attempts
    userInfo.numFailedPasswordsSinceLastLogin += 1;

    setData(data);
    throw HTTPError(400, 'Password is not correct for the given email');
  }

  // Reset the count of failed login attempts and update the count of successful logins
  userInfo.numFailedPasswordsSinceLastLogin = 0;
  userInfo.numSuccessfulLogins += 1;

  // If all credentials are valid, give this user another session:
  const newToken: Token = {
    identifier: data.nextTokenId.toString(),
    authUserId: userInfo.authUserId,
  };

  data.nextTokenId += 1;

  data.sessions.push(newToken);

  // Update dataStore by calling setData which will save it to dataStore.json
  setData(data);

  // Return an object containing the authUserId of the authenticated user
  return {
    token: newToken.identifier,
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
const adminUserDetails = (token: string): UserDetails => {
  // Retrieve the current data
  const data = getData();

  // Find the session based on the provided token
  const session = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // If token is empty or no session with given token is found
  if (token === '' || !session) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }

  // Find the user associated with the session
  const userInfo = data.users.find(
    (user) => user.authUserId === session.authUserId
  ) as UserObject;

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

/**
 * Updates user details for the authorized user.
 *
 * @param token - The authentication token for authorization.
 * @param email - The new email address for the user.
 * @param nameFirst - The new first name for the user.
 * @param nameLast - The new last name for the user.
 *
 * @returns An empty object if the update is successful, or an error object with a status code and error message if there are validation issues.
 */
const adminUserDetailsUpdate = (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): EmptyObject => {
  // Retrieve the current data
  const data = getData();

  // Find the session based on the provided token
  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Check if there is no token
  if (token === '' || !validSession) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }
  // Find authUserId with the associated session
  const authUserId = validSession.authUserId;

  // Find the user to update and let the token for the user, be updated
  const userToBeUpdated = data.users.find(
    (user) => user.authUserId === authUserId
  );

  // Check if the email address is used by another user
  if (emailUsed(email, data)) {
    throw HTTPError(400, 'Email is currently used by another user (excluding the current authorised user)');
  }

  // Check if the email address is valid
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email address');
  }

  // Check if the first name is valid
  if (!validName(nameFirst)) {
    throw HTTPError(400, 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes');
  }

  // Check the length of the first name
  if (nameFirst.length > 20 || nameFirst.length < 2) {
    throw HTTPError(400, 'First name is less than 2 characters or more than 20 characters');
  }

  // Check if the last name is valid
  if (!validName(nameLast)) {
    throw HTTPError(400, 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes');
  }

  // Check the length of the last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    throw HTTPError(400, 'Last name is less than 2 characters or more than 20 characters');
  }

  // Update user
  userToBeUpdated.email = email;
  userToBeUpdated.nameFirst = nameFirst;
  userToBeUpdated.nameLast = nameLast;

  setData(data);

  return {};
};

/**
 * Logs out the currently authenticated user by removing their session token.
 *
 * @param token - The authentication token for the user's session.
 *
 * @returns An empty object if the logout is successful, or an error object with a status code and error message if the token is invalid.
 */
const adminAuthLogout = (token: string): EmptyObject => {
  // Retrieve the current data
  const data = getData();

  // Find the session based on the provided token
  const validSession = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Check if there is no token
  if (token === '' || !validSession) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }
  // Find the index of the current session in session array
  const currSessionPosition = data.sessions.findIndex(
    (currSession) => currSession.identifier === token
  );

  // Delete the current session out of the session array
  data.sessions.splice(currSessionPosition, 1);

  // Update data
  setData(data);

  return {};
};

/**
 * Given details relating to a password change, update the password of a logged in user.
 *
 * @param {string} token - Token of the logged in user
 * @param {string} oldPassword - Current password of user
 * @param {string} newPassword - New password that the password will changed to
 * @returns { EmptyObject | ErrorObject}
 */
const adminUserPasswordUpdate = (
  token: string,
  oldPassword: string,
  newPassword: string
): EmptyObject => {
  // Retrieve the current data
  const data = getData();

  // Find the session based on the provided token
  const session = data.sessions.find(
    (currSession) => currSession.identifier === token
  );

  // Checks if token is empty or invalid
  if (token === '' || !session) {
    throw HTTPError(401, 'Token is empty or invalid (does not refer to valid logged in user session)');
  }

  // Find the user whose password needs update
  const userInfo = data.users.find(
    (user) => user.authUserId === session.authUserId
  );

  // Checks if the old password is the same as current password
  if (userInfo.password !== oldPassword) {
    throw HTTPError(400, 'Old Password is not the correct old password');
  }

  // Checks if old password and new password are the same
  if (oldPassword === newPassword) {
    throw HTTPError(400, 'Old Password and New Password match exactly');
  }

  // Checks if new password has already been used before by this user
  if (
    userInfo.usedPasswords.find((usedPassword) => usedPassword === newPassword)
  ) {
    throw HTTPError(400, 'New Password has already been used before by this user');
  }

  // Checks if new password is less than 8 characters
  if (newPassword.length < 8) {
    throw HTTPError(400, 'New Password is less than 8 characters');
  }

  // Checks if new password contains at least one number and at least one letter
  if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
    throw HTTPError(400, 'New Password does not contain at least one number and at least one letter');
  }

  userInfo.usedPasswords.push(oldPassword);
  userInfo.password = newPassword;

  setData(data);
  return {};
};

export {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserPasswordUpdate,
  adminAuthLogout,
  adminUserDetailsUpdate,
};
