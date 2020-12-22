const path = require("path");
const yaml = require("js-yaml");
const markdownIt = require("markdown-it");
const mdItImplicitFigures = require("markdown-it-implicit-figures");
const acutis = require("./eleventyAcutis");

const manifestPath = path.resolve(__dirname, "_site/assets/manifest.json");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addDataExtension("yaml", yaml.safeLoad);
  eleventyConfig.addCollection("posts", (collectionApi) => {
    const coll = collectionApi.getFilteredByGlob("posts/**/*.md").reverse();
    for (let i = 0; i < coll.length; i++) {
      const previous = coll[i - 1] || null;
      const next = coll[i + 1] || null;
      coll[i].data.previous = previous;
      coll[i].data.next = next;
    }
    return coll;
  });
  eleventyConfig.addCollection("frontPage", (collectionApi) =>
    collectionApi.getFilteredByGlob("posts/**/*.md").reverse().slice(0, 12)
  );
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: (file, _options) => {
      file.excerpt = file.content.split("\n").slice(0, 1).join(" ");
    },
  });
  eleventyConfig.addPlugin(acutis);
  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: true,
      breaks: false,
      linkify: true,
    }).use(mdItImplicitFigures, { figcaption: true })
  );

  eleventyConfig.setBrowserSyncConfig({
    ...eleventyConfig.browserSyncConfig,
    // Reload when manifest file changes
    files: [manifestPath],
    // Speed/clean up build time
    ui: false,
    ghostMode: false,
  });
  return {
    templateFormats: ["md", "acutis", "html"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about those.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`
    // pathPrefix: "/",

    markdownTemplateEngine: "acutis",
    htmlTemplateEngine: "acutis",
    dataTemplateEngine: "acutis",

    // These are all optional, defaults are shown:
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
