%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query SiteMetadata @ppxConfig(inline: true, extend: "Gatsby.ExtendQuery") {
    site {
      siteMetadata {
        title
        description
        siteUrl
        feedUrl
        twitterHandle
      }
    }
  }
  `
)

let use = () => {
  let data = query->useStaticQuery->parse
  Option.getExn(data.site).siteMetadata
}
