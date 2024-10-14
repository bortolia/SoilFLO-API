import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
