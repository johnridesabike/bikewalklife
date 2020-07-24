%raw
"import { graphql } from 'gatsby'";

module ImageFluid = Query_Frag_ImageFluid;

[%graphql
  {|
    query getBlogData {
      allMarkdownRemark(sort: { order: [DESC], fields: [frontmatter___date] }) {
        edges {
          node {
            id
            frontmatter {
              date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
              author
              title
              hero_image {
                childImageSharp {
                  fluid( maxWidth: 800 ) {
                    ...ImageFluid
                  }
                }
              }
            }
            excerpt(pruneLength: 200)
            fields {
              slug
            }
          }
        }
      }
    }
|};
  {inline: true}
];

let useBlogData: unit => t =
  () => query->Gatsby.useStaticQueryUnsafe->parse;
