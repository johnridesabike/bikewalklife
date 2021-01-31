//const fs = require("fs").promises;
//const path = require("path");

//const manifestPath = path.resolve(__dirname, "../_site/assets/manifest.json");

// If we load the preloadAssets automatically we get too much data and it
// defeats the purpose.

module.exports = {
  preloadAssets: [
    "node_modules/@fontsource/source-serif-pro/files/source-serif-pro-latin-700-italic.woff2",
    "node_modules/@fontsource/source-serif-pro/files/source-serif-pro-latin-700-normal.woff2",
    "node_modules/@fontsource/source-serif-pro/files/source-serif-pro-latin-400-italic.woff2",
    "node_modules/@fontsource/source-serif-pro/files/source-serif-pro-latin-400-normal.woff2",
    "node_modules/@fontsource/cooper-hewitt/files/cooper-hewitt-all-400-normal.woff2",
    "node_modules/@fontsource/cooper-hewitt/files/cooper-hewitt-all-400-italic.woff2",
  ],
  environment: process.env.ELEVENTY_ENV,
  heroImageBreakpoints: [
    320, // mobile size
    520,
    720,
    900, // actual size
    1000,
    1200,
    1300,
    1350, // 1.5x size
    1440,
    1530,
    1620,
    1710,
    1800, // 2x size
  ].map((width) => ({ width, height: Math.ceil(width / 2) })),
  // these are the same as markdown images
  heroImageBreakpoints_small: [
    320, // minimum mobile size
    460,
    600, // actual size
    675,
    750,
    825,
    900, // 1.5x actual size
    950,
    1000,
    1050,
    1100,
    1150,
    1200, // 2x actual size
  ].map((width) => ({ width, height: Math.ceil(width / 2) })),
};
