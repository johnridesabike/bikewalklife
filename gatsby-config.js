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
    feedUrl: config.feed_url,
    twitterHandle: config.twitter_handle,
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
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/content/images`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "src-images",
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: "gatsby-plugin-sharp", 
      options: {
        defaultQuality: 75
      }
    },
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          
          "gatsby-remark-normalize-paths",
          "gatsby-remark-copy-linked-files",
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 600,
              linkImagesToOriginal: false,
              // 414 = width of large iPhone in portrait
              srcSetBreakpoints: [414, 600],
              withWebp: true,
            },
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-feed",
      options: rePlugins.PluginFeed.options,
    },
    {
      resolve: "gatsby-plugin-postcss",
      options: {
        postCssPlugins: [
          require("postcss-custom-properties")({
            importFrom: `${__dirname}/src/style.css`
          }),
          require("postcss-custom-media"),
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
    },
    {
      resolve: "gatsby-plugin-webpack-bundle-analyzer",
      options: {
        production: true,
        disable: !process.env.ANALYZE_BUNDLE_SIZE,
        generateStatsFile: true,
        analyzerMode: "static",
      }
    },
    {
      resolve: "gatsby-plugin-nprogress",
      options: {
        color: "#457b9d",
        showSpinner: false,
      },
    },
    {
      resolve: "gatsby-plugin-goatcounter",
      options: {
        // Either `code` or `selfHostUrl` is required.
        // REQUIRED IF USING HOSTED GOATCOUNTER! https://[my_code].goatcounter.com
        code:
          process.env.NODE_ENV === "production"
            ? "jbpjackson"
            : "jbpjackson-dev",

        // REQUIRED IF USING SELFHOSTED GOATCOUNTER!
        // selfHostUrl: `https://example.com`,

        // ALL following settings are OPTIONAL

        // Avoids sending pageview hits from custom paths
        exclude: [],

        // Delays sending pageview hits on route update (in milliseconds)
        pageTransitionDelay: 0,

        // Defines where to place the tracking script
        // boolean `true` in the head and `false` in the body
        head: false,

        // Set to true to include a gif to count non-JS users
        pixel: false,

        // Allow requests from local addresses (localhost, 192.168.0.0, etc.)
        // for testing the integration locally.
        // TIP: set up a `Additional Site` in your GoatCounter settings
        // and use its code conditionally when you `allowLocal`, example below
        allowLocal: false,

        // Override the default localStorage key more below
        //localStorageKey: "skipgc",

        // Set to boolean true to enable referrer set via URL parameters
        // Like example.com?ref=referrer.com or example.com?utm_source=referrer.com
        // Accepts a function to override the default referrer extraction
        // NOTE: No Babel! The function will be passes as is to your websites <head> section
        // So make sure the function works as intended in all browsers you want to support
        //referrer: false,

        // Setting it to boolean true will clean the URL from
        // `?ref` & `?utm_` parameters before sending it to GoatCounter
        // It uses `window.history.replaceState` to clean the URL in the
        // browser address bar as well.
        // This is to prevent ref tracking ending up in your users bookmarks.
        // All parameters other than `ref` and all `utm_` will stay intact
        //urlCleanup: false,
      },
    },
  ],
}
