import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
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
});
