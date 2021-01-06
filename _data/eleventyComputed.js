const config = require("./config.json");

const lang = "en-US";
const timeZone = "America/New_York";

module.exports = {
  absoluteUrl: (data) => new URL(data.page.url, config.site_url).href,
  isoDate: (data) => data.page.date.toISOString(),
  sitemapDate: (data) => {
    return (
      data.page.date.toLocaleString(lang, { year: "numeric", timeZone }) +
      "-" +
      data.page.date.toLocaleString(lang, { month: "2-digit", timeZone }) +
      "-" +
      data.page.date.toLocaleString(lang, { day: "2-digit", timeZone })
    );
  },
  formattedDate: (data) =>
    data.page.date.toLocaleString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone,
    }),
};
