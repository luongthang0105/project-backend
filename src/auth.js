<<<<<<< HEAD
<<<<<<< HEAD

function adminAuthRegister (email, password, nameFirst, nameLast) {
=======
//Register a user with an email, password, and names, then returns their authUserId value.
function adminAuthRegister(email, password, nameFirst, nameLast) {
>>>>>>> 9d01c4e16b87dedca401d11b4c535cc4a138a6a0
  return {
    authUserId: 1
=======
import { getData } from "./dataStore"
import validator from "validator"
import { emailUsed, validName, securedPassword } from "./authHelper"

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
>>>>>>> 65f588ee30704e62400d30335a8b68c45bac12fc
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
  
// This function is responsible for returning user details when the ID is given

<<<<<<< HEAD
function adminUserDetails (authUserId) {
  return {
    user:
      {
        userId: 1,
        name: 'Hayden Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 1,
      }
    }
}
=======
//Given a registered user's email and password returns their authUserId value.
function adminAuthLogin(email, password) {
  return {
    authUserId: 1
  }
}

//Given an admin user's authUserId, return details about the user.
function adminUserDetails(authUserId) {
  return {
    user: {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    }
  }
}
<<<<<<< HEAD
>>>>>>> 9d01c4e16b87dedca401d11b4c535cc4a138a6a0
=======

export {adminAuthRegister}
>>>>>>> 65f588ee30704e62400d30335a8b68c45bac12fc
