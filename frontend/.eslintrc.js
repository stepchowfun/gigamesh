module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:react/recommended',
    'airbnb',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/babel',
    'prettier/react',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'jest'],
  rules: {
    'import/extensions': ['error', 'never', { scss: 'always', svg: 'always' }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    // See https://github.com/typescript-eslint/typescript-eslint/issues/2540 for an explanation of
    // the following two lines:
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-511007063
      // for an explanation of why an empty `node` object is here.
      node: {},
      webpack: {
        config: 'webpack.production.js',
      },
    },
  },
};
