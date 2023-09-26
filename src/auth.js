//Register a user with an email, password, and names, then returns their authUserId value.
function adminAuthRegister(email, password, nameFirst, nameLast) {
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
