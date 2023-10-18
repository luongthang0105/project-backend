import { DataStore } from "./types"

// Return true if newEmail has already been used by another user in data
function emailUsed(newEmail: string, data: DataStore): boolean  {
  for (let user of data.users) {
    if (user.email === newEmail) {
      return true
    }
  }
  return false
}

// Return true if given name is valid
// Name should not contain characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
function validName(name: string): boolean {
  for (let character of name) {
    // character is an alphabetic character
    if (character.toLowerCase() != character.toUpperCase()) continue

    // character is spaces
    if (character === " ") continue

    // character is hyphen
    if (character === "-") continue

    // character is apostrophe
    if (character === "'") continue

    return false
  }

  return true
}

// Return true if password has at least one letter and at least one number
function securedPassword(password: string): boolean {
  let hasLetter = false
  let hasNumber = false

  for (let character of password) {
    // if character is letter
    if (character.toLowerCase() != character.toUpperCase()) {
      hasLetter = true
    }

    // if character is a number (note that isNaN returns false when character is a space so we need to exclude this case)
    if (!isNaN(character as any) && character !== " ") {
      hasNumber = true
    }
  }

  return hasLetter && hasNumber
}

export { validName, securedPassword, emailUsed}