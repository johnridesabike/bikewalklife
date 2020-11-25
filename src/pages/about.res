%%raw(`import { graphql } from "gatsby"`)

open QueryFragments

%graphql(
  `
  query AboutPage @ppxConfig(inline: true) {
    about: file(sourceInstanceName: {eq: "pages"}, relativePath: {eq: "about.md"}) {
      childMarkdownRemark {
        html
        frontmatter {
          title
          intro
          image: image_large {
            alt
            image {
              childImageSharp {
                fixed(width: 240, height: 240, cropFocus: CENTER) {
                  ...ImageFixed_withWebp
                }
              }
            }
          }
        }
      }
    }
  }
  `
)

@react.component
let default = (~data) =>
  switch data->unsafe_fromJson->parse {
  | {
      about:
        Some({
          childMarkdownRemark:
            Some({
              html: Some(html),
              frontmatter: Some({title: Some(title), intro: Some(intro), image}),
            }),
        }),
    } =>
    <Layout metadata=Title({title: title, route: About})>
      <main>
        <h1> {title->React.string} </h1>
        {switch image {
        | Some({image: Some({childImageSharp: Some({fixed})}), alt: Some(alt)}) =>
          <figure className="about__photo-wrapper">
            <Gatsby.Img fixed fadeIn=false alt className="about__photo" />
          </figure>
        | _ => React.null
        }}
        <div className="serif about__intro" dangerouslySetInnerHTML={"__html": intro} />
        <div className="serif" dangerouslySetInnerHTML={"__html": html} />
      </main>
      <aside> <Subscribe /> </aside>
    </Layout>
  | _ => <Page_404 />
  }
