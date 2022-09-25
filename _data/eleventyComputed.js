const { site_url, lang, timeZone } = require("./config.json");

module.exports = {
  pub: (data) => {
    if (data.page.url) {
      return {
        pub: true,
        url: data.page.url,
        absoluteUrl: new URL(data.page.url, site_url).href,
      };
    } else {
      return { pub: false };
    }
  },
  isoDate: (data) => data.page.date.toISOString(),
  sitemapDate: (data) =>
    data.page.date.toLocaleString(lang, { year: "numeric", timeZone }) +
    "-" +
    data.page.date.toLocaleString(lang, { month: "2-digit", timeZone }) +
    "-" +
    data.page.date.toLocaleString(lang, { day: "2-digit", timeZone }),
  formattedDate: (data) =>
    data.page.date.toLocaleString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone,
    }),
};
