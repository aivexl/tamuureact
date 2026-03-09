/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  // Abaikan folder chat karena fiturnya sedang tidak aktif
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/chat/"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/web/src/$1",
  },
};
