const path = require("path");
const yaml = require("js-yaml");
const markdownIt = require("markdown-it");
const acutis = require("./eleventyAcutis");
const htmlmin = require("html-minifier");

const manifestPath = path.resolve(__dirname, "_site/assets/manifest.json");

function mdImages(md, _ops) {
  const defaultRender = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // Add lazy loading
    token.attrPush(["loading", "lazy"]);
    // Add srcset
    // This is very hacky! It should be replaced with something better!
    const src = token.attrs[token.attrIndex("src")][1];
    const [head, tail] = src.split("if_w_gt_600,c_scale,w_600"); // from forestry config
    if (head && tail) {
      // If you don't upscale small images on a 2x display, then they'll get
      // displayed smaller than they should. Ideally we would check to see how
      // big they are and omit the 1.5x and 2x options if they aren't necessary,
      // but until we can do that then upscaling is a necessary evil.
      token.attrPush([
        "srcset",
        `
        ${head}${encodeURIComponent("if_w_gt_400,c_scale,w_400")}${tail} 400w,
        ${head}${encodeURIComponent("if_w_gt_600,c_scale,w_600")}${tail} 600w,
        ${head}${encodeURIComponent("c_scale,w_800")}${tail} 800w,
        ${head}${encodeURIComponent("c_scale,w_1000")}${tail} 1000w,
        ${head}${encodeURIComponent("c_scale,w_1200")}${tail} 1200w
        `,
      ]);
      token.attrPush(["sizes", "(max-width: 600px) 100vw, 600px"]);
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy({
    "assets/images/nps-bicycle-trail.svg": "favicon.svg",
  });
  eleventyConfig.addDataExtension("yaml", yaml.safeLoad);
  eleventyConfig.addCollection("posts", (collectionApi) => {
    const coll = collectionApi
      .getFilteredByGlob("posts/**/*.md")
      .reverse()
      .filter((x) => x.data.visible);
    for (let i = 0; i < coll.length; i++) {
      const previous = coll[i - 1] || null;
      const next = coll[i + 1] || null;
      coll[i].data.previous = previous;
      coll[i].data.next = next;
    }
    return coll;
  });
  eleventyConfig.addCollection("frontPage", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("posts/**/*.md")
      .reverse()
      .filter((x) => x.data.visible)
      .slice(0, 12)
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
      typographer: true,
    }).use(mdImages)
  );
  if (process.env.ELEVENTY_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
      // Eleventy 1.0+: use this.inputPath and this.outputPath instead
      if (outputPath && outputPath.endsWith(".html")) {
        return htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true,
        });
      } else {
        return content;
      }
    });
  }
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

    markdownTemplateEngine: false,
    htmlTemplateEngine: false,
    dataTemplateEngine: false,

    // These are all optional, defaults are shown:
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
