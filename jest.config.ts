import type {JestConfigWithTsJest} from "ts-jest"

const jestConfig: JestConfigWithTsJest ={
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    "<rootDir>/test/setup.ts"
  ]
}

export default jestConfig