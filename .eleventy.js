const path = require("path");
const yaml = require("js-yaml");
const markdownIt = require("markdown-it");
const acutis = require("./eleventyAcutis");
const htmlmin = require("html-minifier");

const manifestPath = path.resolve(
  __dirname,
  "_site",
  "assets",
  "manifest.json"
);

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
      // This will upscale images.
      // Are these the best breakpoints? I have no idea!
      const sizes = [
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
      ];
      token.attrPush([
        "srcset",
        sizes
          .map(
            (x) => `${head}${encodeURIComponent(`c_scale,w_${x}`)}${tail} ${x}w`
          )
          .join(", "),
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
  eleventyConfig.addDataExtension("yaml", yaml.load);
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

  const mdConfig = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  };
  const md = markdownIt(mdConfig).use(mdImages);
  const mdExcerpt = markdownIt(mdConfig).disable(["image"]);
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: (file, _options) => {
      file.excerpt = mdExcerpt.renderInline(
        file.content.split("\n").slice(0, 1).join(" ")
      );
    },
  });
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPlugin(acutis);

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
