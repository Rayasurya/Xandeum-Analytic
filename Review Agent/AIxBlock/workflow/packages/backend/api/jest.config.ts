/* eslint-disable */
export default {
  displayName: 'backend-api',
  preset: '../../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  "moduleNameMapper": {
    "isolated-vm": "<rootDir>/__mocks__/isolated-vm.js"
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/backend/api',
  testTimeout: 120000
};