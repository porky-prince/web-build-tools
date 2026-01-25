const baseConfig = require('../../jest.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  testMatch: ['<rootDir>/test/**/*.{js,ts}'],
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,ts}'],
};
