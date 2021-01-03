//const fs = require("fs").promises;
//const path = require("path");

//const manifestPath = path.resolve(__dirname, "../_site/assets/manifest.json");

// If we load the preloadAssets automatically we get too much data and it
// defeats the purpose.

module.exports = {
  preloadAssets: [
    "node_modules/charter-webfont/fonts/charter_regular.woff",
    "node_modules/charter-webfont/fonts/charter_bold.woff",
    "node_modules/charter-webfont/fonts/charter_italic.woff",
    "node_modules/charter-webfont/fonts/charter_bold_italic.woff",
    "node_modules/@fontsource/cooper-hewitt/files/cooper-hewitt-all-400-normal.woff2",
    "node_modules/@fontsource/cooper-hewitt/files/cooper-hewitt-all-400-italic.woff2",
  ],
  environment: process.env.ELEVENTY_ENV,
};
