import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';

const toHaveValidRandomPlayerName: MatcherFunction<[]> =
  // `floor` and `ceiling` get types from the line above
  // it is recommended to type them as `unknown` and to validate the values
  function (actual: string) {
    let pass = true;

    const checkSet = new Set(actual.split(''));
    if (actual.length !== 8 || checkSet.size !== 8) pass = false;
    else if (
      !(/^[a-zA-Z]+$/.test(actual.slice(0, 5))) ||
      !(/^[\d]+$/.test(actual.slice(5)))
    ) {
      pass = false;
    }
    if (pass) {
      return {
        message: () =>
          // `this` context will have correct typings
          `expected ${this.utils.printReceived(
            actual
          )} not to have the structure: [5 letters][3 numbers] where there are no repetitions of numbers or characters within the same name`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            actual
          )} to have the structure: [5 letters][3 numbers] where there are no repetitions of numbers or characters within the same name`,
        pass: false,
      };
    }
  };

expect.extend({
  toHaveValidRandomPlayerName,
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toHaveValidRandomPlayerName(): void
  }
  interface Matchers<R> {
    toHaveValidRandomPlayerName(): R
  }
}
