/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/apps/web/src/test/setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: "apps/web/tsconfig.json"
    }],
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/chat/"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/web/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
};
