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
        }
      }
    }
    johnpic: file(name: {eq: "john-2020"}, sourceInstanceName: {eq: "images"}) {
      childImageSharp {
        fixed(width: 240, height: 240, cropFocus: CENTER) {
          ...ImageFixed_withWebp
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
      about: Some({
        childMarkdownRemark: Some({
          html: Some(html),
          frontmatter: Some({
            title: Some(title),
            intro: Some(intro),
          })
        })
      }),
      johnpic,
    }=>
    <Layout metadata=Title({title, route: About})>
      <main>
        <h1> {title->React.string} </h1>
        {switch johnpic {
        | Some({childImageSharp: Some({fixed})}) =>
          <figure className="about__photo-wrapper">
            <Gatsby.Img
              fixed
              fadeIn=false
              alt="A photograph of John."
              className="about__photo"
            />
          </figure>
        | _ => React.null
        }}
        <div
          className="serif about__intro"
          dangerouslySetInnerHTML={"__html": intro}
        />
        <div className="serif" dangerouslySetInnerHTML={"__html": html} />
      </main>
      <aside>
        <Subscribe />
      </aside>
    </Layout>
  | _ => <Page_404 />
  }
