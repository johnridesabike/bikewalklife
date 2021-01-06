const config = require("./config.json");

/*
  For some reason the live preview on Forestry messes up Eleventy's dates?
*/
const getDate = (date) => {
  if (typeof date === "string") {
    console.warn("DATE WASN'T PARSED CORRECTLY ", date);
    return new Date(date);
  } else {
    return date;
  }
};

module.exports = {
  absoluteUrl: (data) => new URL(data.page.url, config.site_url).href,
  isoDate: (data) => getDate(data.page.date).toISOString(),
  sitemapDate: (data) => {
    const date = getDate(data.page.date);
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
  formattedDate: (data) =>
    getDate(data.page.date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/New_York",
    }),
};
