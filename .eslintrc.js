module.exports = {
  globals: {
    __PATH_PREFIX__: true,
  },
  extends: [
    "react-app",
  ],
  rules: {
    "default-case": 0,
    "no-unreachable": 0,
    quotes: ["error", "double"],
    indent: ["error", 2],
  },
  overrides: [
    {
      files: ["*.bs.js"],
      rules: {
        indent: 0,
      }
    }
  ]
};
