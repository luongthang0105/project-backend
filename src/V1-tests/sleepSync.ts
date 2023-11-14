export function sleepSync(duration: number) {
  const startTime = new Date().getTime();
  const waitTime = duration * 1000;
  while (new Date().getTime() - startTime < waitTime) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}
  
  