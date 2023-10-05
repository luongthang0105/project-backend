import { getData, setData } from "./dataStore.js"
import validator from "validator"
import { emailUsed, validName, securedPassword } from "./authHelper.js"


//Register a user with an email, password, and names, then returns their authUserId value.
function adminAuthRegister(email, password, nameFirst, nameLast) {
  let data = getData()

  // email address used by another user
  if (emailUsed(email, data) === true) {
    return {
      error: "Email address used by another user"
    }
  }

  // email address invalid
  if (validator.isEmail(email) === false) {
    return {
      error: "Invalid email address"
    }
  }

  if (validName(nameFirst) === false) {
    return {
      error: "First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes"
    }
  }

  if (nameFirst.length > 20 || nameFirst.length < 2) {
    return {
      error: "First name length must be between 2 and 20 characters"
    }
  }

  if (validName(nameLast) === false) {
    return {
      error: "Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes"
    }
  }

  if (nameLast.length > 20 || nameLast.length < 2) {
    return {
      error: "Last name length must be between 2 and 20 characters"
    }
  }

  if (password.length < 8) {
    return {
      error: "Password must have at least 8 characters"
    }

  }

  if (securedPassword(password) === false) {
    return {
      error: "Password must contain at least one number and at least one letter"
    }
  }

  let user = {
    authUserId: data.nextUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  }

  data.users.push(user)
  data.nextUserId += 1


  return { authUserId: user.authUserId }
}

//Given a registered user's email and password returns their authUserId value.
function adminAuthLogin(email, password) {
  const data = getData()
  const userInfo = data.users.find(user => user.email === email)
  if (!userInfo) {
    return { error: "Email adress does not exist" }
  }
  if (userInfo.password !== password) {
    userInfo.numFailedPasswordsSinceLastLogin += 1
    return { error: "Password is not correct for the given email" }
  }
  userInfo.numFailedPasswordsSinceLastLogin = 0
  userInfo.numSuccessfulLogins += 1
  return {
    authUserId: userInfo.authUserId
  }
}

//Given an admin user's authUserId, return details about the user.
function adminUserDetails(authUserId) {
  const data = getData()
  const userInfo = data.users.find(user => user.authUserId === authUserId)
  if (!userInfo) {
    return { error: "AuthUserId is not a valid user" }
  }
  const fullname = userInfo.nameFirst.concat(" ", userInfo.nameLast)
  return {
    user: {
      userId: authUserId,
      name: fullname,
      email: userInfo.email,
      numSuccessfulLogins: userInfo.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: userInfo.numFailedPasswordsSinceLastLogin
    }
  }
}

export {adminAuthRegister, adminAuthLogin, adminUserDetails}

