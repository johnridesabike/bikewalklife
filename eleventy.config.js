const markdownIt = require("markdown-it");
const htmlmin = require("html-minifier");
const acutis = require("acutis-lang/eleventy");
const acutisComponents = require("./_includes/acutisComponents");

function mdImages(md, _ops) {
  const defaultRender = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // Add lazy loading
    token.attrPush(["loading", "lazy"]);
    // Add srcset
    // This is very hacky! It should be replaced with something better!
    const src = token.attrs[token.attrIndex("src")][1];
    const [head, tail] = src.split("t_md_body_retina"); // from forestry config
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
          .map((w) =>
            `${head}c_scale,w_${w}${tail} ${w}w`.replace(
              /,/g,
              encodeURIComponent
            )
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
  eleventyConfig.addPassthroughCopy("assets/webmentions.js");
  eleventyConfig.addPassthroughCopy({
    "assets/images/nps-bicycle-trail.svg": "favicon.svg",
  });
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
  eleventyConfig.addCollection("pages", (collectionApi) => ({
    about: collectionApi.getFilteredByTag("page_about")[0],
    archive: collectionApi.getFilteredByTag("page_archive")[0],
    contact: collectionApi.getFilteredByTag("page_contact")[0],
    index: collectionApi.getFilteredByTag("page_index")[0],
    search: collectionApi.getFilteredByTag("page_search")[0],
  }));

  const mdConfig = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  };
  const md = markdownIt(mdConfig).use(mdImages);
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPlugin(acutis, {
    components: acutisComponents,
  });

  if (process.env.ELEVENTY_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", function (content) {
      if (this.outputPath && this.outputPath.endsWith(".html")) {
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
  return {
    templateFormats: ["md", "acutis", "html", "11ty.js"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: false,
  };
};
