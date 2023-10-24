import {expect} from '@jest/globals';
import type {MatcherFunction} from 'expect';
import { Colour } from '../types';

const toHaveValidColour: MatcherFunction<[]> =
  // `floor` and `ceiling` get types from the line above
  // it is recommended to type them as `unknown` and to validate the values
  function (actual) {
    if (
      typeof actual !== 'string'
	) {
      throw new Error('These must be of type string!');
    }

	const colours: Colour[] = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
    const pass = colours.includes(actual as Colour);
    if (pass) {
      return {
        message: () =>
          // `this` context will have correct typings
          `expected ${this.utils.printReceived(
            actual,
          )} not to be within ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange']`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            actual,
          )} to be within ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange']`,
        pass: false,
      };
    }
  };

expect.extend({
  toHaveValidColour,
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toHaveValidColour(): void;
  }
  interface Matchers<R> {
    toHaveValidColour(): R;
  }
}