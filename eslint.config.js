const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.es2026,
        ...globals.node,
        ...globals.browser,
        ...globals.jest
      }
    },
    rules: {
      semi: 2,
      'no-console': 2,
      'no-empty': 2,
      eqeqeq: [2, 'always'],
      'no-unused-vars': 1,
      'no-unsafe-negation': 2,
      'prefer-const': 2,
      'no-var': 2
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
];
