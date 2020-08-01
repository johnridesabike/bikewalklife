const config = require("./config.json")
const aboutData = require("./content/data/about.json")

module.exports = {
  //this makes the site config available to forestry cms
  siteMetadata: {
    title: config.title,
    description: config.description,
    about: config.about,
    contact: config.contact,
    aboutData: aboutData,
    siteUrl: config.site_url,
    archivePerPage: config.archive_per_page,
    copyright: config.copyright,
    feedUrl: config.feed_url
  },
  plugins: [
    "gatsby-transformer-remark",
    "gatsby-plugin-react-helmet",
    "gatsby-transformer-yaml",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "src",
        path: `${__dirname}/src/`,
      },
    },
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
      options: require("./lib/js/src/GatsbyConfig.bs.js").PluginFeed.options,
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
        icon: "./src/images/nps-bicycle-trail.svg",
      },
    },
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        host: config.site_url,
        policy: [
          {
            userAgent: "*",
            disallow: "/"
          }
        ]
      }
    }
  ],
}
