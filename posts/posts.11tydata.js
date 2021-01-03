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
 For some reason the live preview on Forestry messes up Eleventy's dates.
 This does some checks to "fix" it.
*/

module.exports = {
  layout: "Layout_Entry.acutis",
  eleventyComputed: {
    isoDate: (data) => {
      if (typeof data.date === "string") {
        console.warn("DATE WASN'T PARSED CORRECTLY", data.date);
        return new Date(data.date).toISOString();
      } else {
        return data.date.toISOString();
      }
    },
    dateString: (data) => {
      let date;
      if (typeof data.date === "string") {
        console.warn("DATE WASN'T PARSED CORRECTLY", data.date);
        date = new Date(data.date);
      } else {
        date = data.date;
      }
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/New_York",
      });
    },
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
