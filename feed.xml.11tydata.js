const config = require("./_data/config.json");

module.exports = {
  permalink: config.feed_url,
  eleventyExcludeFromCollections: true,
};
