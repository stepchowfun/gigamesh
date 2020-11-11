/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  // We have to use this instead of `'<rootDir>/src/frontend'` because Jest
  // doesn't currently follow symlinks, and `src` is a symlink. See
  // https://github.com/facebook/jest/issues/1477 for details.
  roots: [fs.realpathSync(path.resolve(__dirname, 'src'))],
  testEnvironment: 'node',
};
