// Helper function to check if a string contains alphanumeric characters or spaces
const alphanumericAndSpaceCheck = (str: string): boolean => /^[A-Za-z\s\d]*$/.test(str)

// Helper function to get the current timestamp in seconds
const getCurrentTimestamp = (): number => Math.floor(Date.now() / 1000)

export { alphanumericAndSpaceCheck, getCurrentTimestamp }
