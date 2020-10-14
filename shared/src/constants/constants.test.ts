import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
  originDevelopment,
  originProduction,
} from './constants';

describe('constants', () => {
  it('cloudFunctionsBaseUrlDevelopment starts with http://', () => {
    expect.hasAssertions();
    expect(cloudFunctionsBaseUrlDevelopment).toMatch(/^http:\/\//);
  });

  it('cloudFunctionsBaseUrlProduction starts with https://', () => {
    expect.hasAssertions();
    expect(cloudFunctionsBaseUrlProduction).toMatch(/^https:\/\//);
  });

  it('originDevelopment starts with http://', () => {
    expect.hasAssertions();
    expect(originDevelopment).toMatch(/^http:\/\//);
  });

  it('originProduction starts with https://', () => {
    expect.hasAssertions();
    expect(originProduction).toMatch(/^https:\/\//);
  });
});
