// Do not delete this file
import { echo } from './echo.js'

test('Test successful echo', () => {
  let result = echo('1')
  expect(result).toStrictEqual('1')
  result = echo('abc')
  expect(result).toStrictEqual('abc')
})

test('Test invalid echo', () => {
  expect(echo({ echo: 'echo' })).toMatchObject({ error: expect.any(String) })
})
