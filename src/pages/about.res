%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query AboutPage @ppxConfig(inline: true) {
    file(sourceInstanceName: {eq: "pages"}, relativePath: {eq: "about.md"}) {
      childMarkdownRemark {
        html
        frontmatter {
          title
          intro
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
      file: Some({
        childMarkdownRemark: Some({
          html: Some(html),
          frontmatter: Some({
            title: Some(title),
            intro: Some(intro),
          })
        })
      })
    }=>
    <Layout metadata=Title({title, route: About})>
      <main>
        <h1> {title->React.string} </h1>
        <div className="serif" dangerouslySetInnerHTML={"__html": intro} />
        <div className="serif" dangerouslySetInnerHTML={"__html": html} />
      </main>
      <aside>
        <Subscribe />
      </aside>
    </Layout>
  | _ => <Page_404 />
  }
