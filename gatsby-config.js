const config = require("./config.json")
const rePlugins = require("./lib/js/src/GatsbyConfig.bs.js");

module.exports = {
  //this makes the site config available to forestry cms
  siteMetadata: {
    title: config.title,
    description: config.description,
    about: config.about,
    contact: config.contact,
    siteUrl: config.site_url,
    archivePerPage: config.archive_per_page,
    feedUrl: config.feed_url
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-transformer-yaml",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/content/posts`
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "data",
        path: `${__dirname}/content/data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "images",
        path: `${__dirname}/content/images`,
      },
    },
    {
      resolve: "gatsby-plugin-sharp", 
      options: {
        defaultQuality: 75
      }
    },
    `gatsby-transformer-sharp`,
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          "gatsby-remark-relative-images",
          "gatsby-remark-normalize-paths",
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 1000,
              linkImagesToOriginal: false,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: rePlugins.PluginFeed.options,
    },
    {
      resolve: "gatsby-plugin-postcss",
      options: {
        postCssPlugins: [
          require("postcss-custom-properties")({
            importFrom: `${__dirname}/src/styles/variables.css`
          })
        ]
      }
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: config.title,
        short_name: config.title,
        start_url: "/",
        background_color: "#fff",
        theme_color: "#457B9D",
        display: "standalone",
        icon: `${__dirname}/src/images/nps-bicycle-trail.svg`,
        icon_options: {
          // For all the options available, please see:
          // https://developer.mozilla.org/en-US/docs/Web/Manifest
          // https://w3c.github.io/manifest/#purpose-member
          purpose: "any maskable",
        },
      },
    },
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        host: config.site_url,
        policy: []
      }
    },
    {
      resolve: "gatsby-plugin-sitemap",
      options: rePlugins.PluginSiteMap.options
    }
  ],
}
