import { isProduction } from './environment';

test('isProduction() returns false', () => {
  expect(isProduction()).toBeFalsy();
});
