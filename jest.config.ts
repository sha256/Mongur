import type {JestConfigWithTsJest} from "ts-jest"

const jestConfig: JestConfigWithTsJest ={
  roots: ['<rootDir>/test'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    "<rootDir>/test/setup.ts"
  ],
  globalSetup: '<rootDir>/test/globalSetup.js',
  globalTeardown: '<rootDir>/test/globalTeardown.js',
}

export default jestConfig