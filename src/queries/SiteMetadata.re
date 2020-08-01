%raw
"import { graphql } from 'gatsby'";

[%graphql
  {|
    query getMetadata {
      site {
        siteMetadata {
          title
          description
          copyright
          siteUrl
          feedUrl
          aboutData {
            title
            description
            contact {
              email
            }
          }
        }
      }
    }
|};
  {inline: true}
];

let useQuery: unit => t =
  () => query->Gatsby.useStaticQueryUnsafe->parse;
