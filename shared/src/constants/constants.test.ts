import { isProduction } from './constants';

describe('constants', () => {
  it('isProduction() returns false in test mode', () => {
    expect.hasAssertions();
    expect(isProduction()).toBe(false);
  });
});
