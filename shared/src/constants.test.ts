import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
  originDevelopment,
  originProduction,
} from './constants';

test('cloudFunctionsBaseUrlDevelopment starts with http://', () => {
  expect(cloudFunctionsBaseUrlDevelopment).toMatch(/^http:\/\//);
});

test('cloudFunctionsBaseUrlProduction starts with https://', () => {
  expect(cloudFunctionsBaseUrlProduction).toMatch(/^https:\/\//);
});

test('originDevelopment starts with http://', () => {
  expect(originDevelopment).toMatch(/^http:\/\//);
});

test('originProduction starts with https://', () => {
  expect(originProduction).toMatch(/^https:\/\//);
});
