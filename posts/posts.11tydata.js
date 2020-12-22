const path = require("path");

module.exports = {
  layout: "Layout_Entry.acutis",
  eleventyComputed: {
    isoDate: (data) => data.date.toJSON(),
    dateString: (data) =>
      data.date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/New_York",
      }),
    hero_image: (data) => {
      if (data.hero_image && data.hero_image.image !== "") {
        return data.hero_image;
      } else {
        return null;
      }
    },
    permalink: (data) => {
      const dir = path
        .dirname(data.page.filePathStem)
        .replace(/^(\/posts)/, "");
      const slug = data.page.fileSlug;
      const permalink = data.permalink || dir + "/" + slug + "/";
      if (process.env.ELEVENTY_ENV !== "production") {
        return permalink;
      } else {
        if (data.draft) {
          return false;
        } else {
          return permalink;
        }
      }
    },
  },
};
