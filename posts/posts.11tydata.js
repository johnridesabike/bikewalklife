const config = require("../_data/config.json");
const globalComputed = require("../_data/eleventyComputed");

// Drafts are not visible in production. They are visible in development.
const isVisible = (draft, { yes, no }) => {
  if (process.env.ELEVENTY_ENV !== "production") {
    return yes();
  } else {
    if (draft) {
      return no();
    } else {
      return yes();
    }
  }
};

module.exports = {
  layout: "Layout_Entry.acutis",
  eleventyComputed: {
    // A workaround for this bug: https://github.com/11ty/eleventy/issues/1303
    isoDate: globalComputed.isoDate,
    sitemapDate: globalComputed.sitemapDate,
    formattedDate: globalComputed.formattedDate,
    hero_image: (data) => {
      if (data.hero_image && data.hero_image.image !== "") {
        return data.hero_image;
      } else {
        return null;
      }
    },
    external_link: (data) =>
      data.external_link !== "" ? data.external_link : null,
    permalink: (data) =>
      isVisible(data.draft, {
        yes: () =>
          data.permalink ||
          data.page.filePathStem.replace(/^(\/posts)/, "") + "/",
        no: () => false,
      }),
    visible: (data) =>
      isVisible(data.draft, { yes: () => true, no: () => false }),
    pub: (data) =>
      isVisible(data.draft, {
        no: () => ({ pub: false }),
        yes: () => ({
          pub: true,
          url: data.page.url,
          excerpt: data.excerpt,
          absoluteUrl: new URL(data.page.url, config.site_url).href,
          permalink:
            data.permalink ||
            data.page.filePathStem.replace(/^(\/posts)/, "") + "/",
        }),
      }),
  },
};
