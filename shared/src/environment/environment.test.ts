import { isProduction } from './environment';

describe('environment', () => {
  it('isProduction() returns false', () => {
    expect.hasAssertions();
    expect(isProduction()).toBe(false);
  });
});
