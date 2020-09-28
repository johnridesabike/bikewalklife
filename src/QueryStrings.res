%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query Strings @ppxConfig(inline: true, extend: "Gatsby.ExtendQuery") {
    strings {
      footer
      contact_text
      archive_link
      subscribe_feed_cta
      subscribe_email_cta
      open_linked
    }
  }
  `
)

let use = () => {
  let data = query->useStaticQuery->parse
  Option.getExn(data.strings)
}
