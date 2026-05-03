/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.test.{js,jsx,ts,tsx}",
    "**/__tests__/**/*.spec.{js,jsx,ts,tsx}",
  ],
  moduleNameMapper: {
    // Stub static assets (CSS, images) so they don't break Jest
    "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|svg|ico|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
