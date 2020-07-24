%raw
"import { graphql } from 'gatsby'";

[%graphql
  {|
    query getMetadata {
      site {
        siteMetadata {
          title
          description
          repoUrl
          infoData {
            contact {
              email
              github_handle
              twitter_handle
            }
            cta
            description
            background_color
          }
        }
      }
    }
|};
  {inline: true}
];

let useSiteMetadata: unit => t =
  () => query->Gatsby.useStaticQueryUnsafe->parse;
