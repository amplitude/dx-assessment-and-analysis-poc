// const baseConfig = require('../../../jest.config.js');
// const package = require('./package');
//
// module.exports = {
//   ...baseConfig,
//   preset: 'ts-jest',
//   displayName: package.name,
//   rootDir: '.',
//   testEnvironment: 'node',
// };

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true
};
