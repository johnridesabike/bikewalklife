module.exports = {
  globals: {
    __PATH_PREFIX__: true,
  },
  plugins: [],
  extends: [
    "eslint:recommended",
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2018,
  },
  rules: {
    "default-case": 0,
    "no-unreachable": 0,
    quotes: ["error", "double"],
    indent: ["error", 2],
    "no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["*.bs.js"],
      rules: {
        indent: 0,
        "no-unused-vars": 0,
      }
    }
  ]
};
