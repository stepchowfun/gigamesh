import { originDevelopment, originProduction } from './constants';

describe('constants', () => {
  it('originDevelopment starts with http://', () => {
    expect.hasAssertions();
    expect(originDevelopment).toMatch(/^http:\/\//);
  });

  it('originProduction starts with https://', () => {
    expect.hasAssertions();
    expect(originProduction).toMatch(/^https:\/\//);
  });
});
