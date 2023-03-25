const htmlmin = require("html-minifier");
const acutis = require("acutis-lang/eleventy");
const acutisComponents = require("./_includes/acutisComponents");

// TODO: this is kind of hacky and has some problems.
// - This will upscale images.
// - This hardcodes the article body width at 600 pixels.
// - This only works with Cloudinary URLs.
// - Are these the best breakpoints? I have no idea!
const mdImageBreakpoints = [
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

const mdImageSizesAttr = "(max-width: 600px) 100vw, 600px";

// https://cloudinary.com/documentation/transformation_reference
// Cloudinary URL pathnames should have at least 4 indexed parts:
// <blank>(0)/<cloud_name>(1)/<asset_type>(2)/<delivery_type>(3)/<...rest>(4+)
// We insert our transforms into the 4th index.
function transformImageUrl(url) {
  if (url.host === "res.cloudinary.com") {
    const pathname = url.pathname.split("/");
    if (pathname.length < 5) {
      console.error("Invalid Cloudinary URL: ", url.href);
      return null;
    } else {
      function makeHref(size, quality) {
        // Commas conflict with the HTML srcset syntax, so encode them.
        size = encodeURIComponent(size);
        quality = encodeURIComponent(quality);
        const pathnameCopy = pathname.slice();
        pathnameCopy.splice(4, 0, size, quality);
        url.pathname = pathnameCopy.join("/");
        return url.href;
      }
      const src = makeHref("t_md_body_retina", "f_auto,q_auto");
      const srcset = mdImageBreakpoints
        .map((width) => {
          const href = makeHref(`c_scale,w_${width}`, "f_auto,q_auto");
          return `${href} ${width}w`;
        })
        .join(", ");
      return { src, srcset, sizes: mdImageSizesAttr };
    }
  } else {
    return null;
  }
}

function mdImages(md, _ops) {
  const defaultRender = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    token.attrPush(["loading", "lazy"]);
    const src = token.attrs[token.attrIndex("src")][1];
    let url = null;
    try {
      url = new URL(src);
    } catch (e) {
      console.log("Warning:", src, "is not a valid image URL.");
    }
    if (url) {
      const urlData = transformImageUrl(url);
      if (urlData) {
        token.attrSet("src", urlData.src);
        token.attrPush(["srcset", urlData.srcset]);
        token.attrPush(["sizes", urlData.sizes]);
      }
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

  eleventyConfig.amendLibrary("md", (md) =>
    md
      .set({
        html: true,
        breaks: false,
        linkify: true,
        typographer: true,
      })
      .use(mdImages)
  );

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
