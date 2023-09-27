<<<<<<< HEAD

function adminAuthRegister (email, password, nameFirst, nameLast) {
=======
//Register a user with an email, password, and names, then returns their authUserId value.
function adminAuthRegister(email, password, nameFirst, nameLast) {
>>>>>>> 9d01c4e16b87dedca401d11b4c535cc4a138a6a0
  return {
    authUserId: 1
  }

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
>>>>>>> 9d01c4e16b87dedca401d11b4c535cc4a138a6a0
