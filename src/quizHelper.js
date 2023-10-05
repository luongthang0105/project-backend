// Helper function to check if a string contains alphanumeric characters or spaces
export function alphanumericAndSpaceCheck(str) {
  return /^[A-Za-z\s\d]*$/.test(str)
}

// Helper function to get the current timestamp
export function getCurrentTimestamp () {
  return Math.floor(Date.now() / 1000)
}