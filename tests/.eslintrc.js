'use strict';

module.exports = {
  env: {
    embertest: true,
  },
  rules: {
    'max-statements': 0,
    'no-magic-numbers': 0,
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['dummy/lib/**/*.js', 'dummy/lib/**/config/*.js'],
    },
  ],
};
