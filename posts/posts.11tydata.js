// Drafts are not visible in production. They are visible in development.
const isVisible = (data, { yes, no }) => {
  if (process.env.ELEVENTY_ENV !== "production") {
    return yes();
  } else {
    if (data.draft) {
      return no();
    } else {
      return yes();
    }
  }
};

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
    permalink: (data) =>
      isVisible(data, {
        yes: () =>
          data.permalink ||
          data.page.filePathStem.replace(/^(\/posts)/, "") + "/",
        no: () => false,
      }),
    visible: (data) => isVisible(data, { yes: () => true, no: () => false }),
  },
};
