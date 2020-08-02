%raw
"import { graphql } from 'gatsby'";

[%graphql
  {|
    query getMetadata {
      site {
        siteMetadata {
          title
          description
          copyrightYear
          siteUrl
          feedUrl
          aboutData {
            title
            description
          }
        }
      }
    }
|};
  {inline: true}
];

let useQuery: unit => t =
  () => query->Gatsby.useStaticQueryUnsafe->parse;
