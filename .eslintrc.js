module.exports = {
  "env": {
    "browser": true
  },
  "globals": {
  },
  "extends": "eslint:recommended",
  "installedESLint": true,
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    },
    "sourceType": "module"
  },
  "plugins": [
  ],
  "rules": {
    "no-tabs":1,
    "no-console":0,
    "indent": [
      "error",
      2,
      {
        "VariableDeclarator": 2,
        "SwitchCase": 1
      }
    ],
    "linebreak-style": 0,
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-unused-vars": [0, { "varsIgnorePattern": "h" }]
  }
};
