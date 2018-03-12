module.exports = {
  "extends": "semistandard",
  "parser": "babel-eslint",
  "plugins": [
    "standard",
    "promise",
    "mocha",
    "html",
    "chai-friendly"
  ],
  "env": {
    "browser": true,
    "node": true,
    "mocha": true
  },
  "rules": {
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2
  }
};