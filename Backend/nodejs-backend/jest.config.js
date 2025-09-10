module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js", "!src/app.js", "!src/config/**", "!src/database/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  // Removed moduleNameMapper for sequelize to fix DataTypes undefined error in tests
  // moduleNameMapper: {
  //   "^sequelize$": "<rootDir>/test/mocks/sequelize.js"
  // }
};
