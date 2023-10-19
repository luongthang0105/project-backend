import { getData, setData } from "./dataStore"
import validator from "validator"
import { emailUsed, validName, securedPassword } from "./authHelper"

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

function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { authUserId: number } | { error: string} {
  // Retrieve the current data
  let data = getData()

  // Check if the email address is used by another user
  if (emailUsed(email, data)) {
    return {
      error: "Email address used by another user",
    }
  }

  // Check if the email address is valid
  if (!validator.isEmail(email)) {
    return {
      error: "Invalid email address",
    }
  }

  // Check if the first name is valid
  if (!validName(nameFirst)) {
    return {
      error:
        "First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes",
    }
  }

  // Check the length of the first name
  if (nameFirst.length > 20 || nameFirst.length < 2) {
    return {
      error: "First name length must be between 2 and 20 characters",
    }
  }

  // Check if the last name is valid
  if (!validName(nameLast)) {
    return {
      error:
        "Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes",
    }
  }

  // Check the length of the last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    return {
      error: "Last name length must be between 2 and 20 characters",
    }
  }

  // Check the length of the password
  if (password.length < 8) {
    return {
      error: "Password must have at least 8 characters",
    }
  }

  // Check if the password contains at least one number and one letter
  if (!securedPassword(password)) {
    return {
      error:
        "Password must contain at least one number and at least one letter",
    }
  }

  // Create a new user object
  let user = {
    authUserId: data.nextUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  }
  // Add the new user to the data
  data.users.push(user)
  data.nextUserId += 1

  // update dataStore by calling setData which will save it to dataStore.json
  setData(data)
    
  // Return an object containing the authUserId of the registered user
  return { authUserId: user.authUserId }
}

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
function adminAuthLogin(email: string, password: string): { authUserId: number } | { error: string} {
  // Retrieve the current data
  const data = getData()

  // Find user information based on the provided email
  const userInfo = data.users.find((user) => user.email === email)

  // If the email does not exist in the database, return an error
  if (!userInfo) {
    return { error: "Email adress does not exist" }
  }

  // Check if the provided password matches the stored password
  if (userInfo.password !== password) {
    // Increment the count of failed login attempts
    userInfo.numFailedPasswordsSinceLastLogin += 1
    
    setData(data)
    return { error: "Password is not correct for the given email" }
  }
  // Reset the count of failed login attempts and update the count of successful logins
  userInfo.numFailedPasswordsSinceLastLogin = 0
  userInfo.numSuccessfulLogins += 1

  // update dataStore by calling setData which will save it to dataStore.json
  setData(data)
  
  // Return an object containing the authUserId of the authenticated user
  return {
    authUserId: userInfo.authUserId,
  }
}

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
function adminUserDetails(authUserId: number): { user: { userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number }} |  {error: string} {
  // Retrieve the current data
  const data = getData()

  // Find user information based on the provided authUserId
  const userInfo = data.users.find((user) => user.authUserId === authUserId)

  // If the authUserId is not valid, return an error
  if (!userInfo) {
    return { error: "AuthUserId is not a valid user" }
  }

  // Concatenate the first name and last name to form the full name
  const fullname = userInfo.nameFirst.concat(" ", userInfo.nameLast)

  // Return an object containing details about the admin user
  return {
    user: {
      userId: authUserId,
      name: fullname,
      email: userInfo.email,
      numSuccessfulLogins: userInfo.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin:
        userInfo.numFailedPasswordsSinceLastLogin,
    },
  }
}

export { adminAuthRegister, adminAuthLogin, adminUserDetails }
