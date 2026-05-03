const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.spec.ts", "**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],
  moduleNameMapper: {
    // Redirect all @prisma/client imports to the singleton mock so that every
    // `new PrismaClient()` in production models returns the same mock instance.
    "^@prisma/client$": "<rootDir>/src/__mocks__/prismaClient.ts",
  },
};