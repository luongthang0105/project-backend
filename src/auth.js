// Return true if newEmail has already been used by another user in data
function emailUsed(newEmail, data) {
  for (let user of data.users) {
    if (user.email === newEmail) {
      return true
    }
  }
  return false
}

// Return true if given name is valid 
// Name should not contain characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
function validName(name) {
  for (let character of name) {
    // character is an alphabetic character 
    if (character.toLowerCase() != character.toUpperCase()) continue

    // character is spaces
    if (character === " ") continue

    // character is hyphen
    if (character === '-') continue

    // character is apostrophe
    if (character === "'") continue

    return false
  }

  return true
}

// Return true if password has at least one letter and at least one number 
function securedPassword(password) {
  let hasLetter = false
  let hasNumber = false

  for (let character of password) {
    // if character is letter
    if (character.toLowerCase() != character.toUpperCase()) {
      hasLetter = true
    }

    // if character is a number
    if (!character.isNan()) {
      hasNumber = true``
    }
  }

  return hasLetter && hasNumber
}
//Register a user with an email, password, and names, then returns their authUserId value.
function adminAuthRegister(email, password, nameFirst, nameLast) {
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

  data = getData()

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

export {adminAuthRegister}