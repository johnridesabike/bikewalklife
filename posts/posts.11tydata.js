const config = require("../_data/config.json");

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

/*
  For some reason the live preview on Forestry messes up Eleventy's dates?
*/
const getDate = (data) => {
  if (typeof data.date === "string") {
    console.warn("DATE WASN'T PARSED CORRECTLY for ", data.title);
    return new Date(data.date);
  } else {
    return data.date;
  }
};

module.exports = {
  layout: "Layout_Entry.acutis",
  eleventyComputed: {
    // TODO: move this to a global data file
    absoluteUrl: (data) => new URL(data.page.url, config.site_url).href,
    isoDate: (data) => getDate(data).toISOString(),
    sitemapDate: (data) => {
      const date = getDate(data);
      return (
        date.toLocaleString("en-US", {
          year: "numeric",
          timeZone: "America/New_York",
        }) +
        "-" +
        date.toLocaleString("en-US", {
          month: "2-digit",
          timeZone: "America/New_York",
        }) +
        "-" +
        date.toLocaleString("en-US", {
          day: "2-digit",
          timeZone: "America/New_York",
        })
      );
    },
    dateString: (data) =>
      getDate(data).toLocaleString("en-US", {
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
    external_link: (data) =>
      data.external_link !== "" ? data.external_link : null,
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
