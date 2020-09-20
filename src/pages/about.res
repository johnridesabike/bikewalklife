%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query AboutPage @ppxConfig(inline: true) {
    dataYaml(page: {eq: ABOUT}) {
      title
      intro
      body
    }
  }
  `
)

@react.component
let default = (~data) =>
  switch data->unsafe_fromJson->parse {
  | {dataYaml: Some({title, intro, body})} =>
    <Layout metadata=Title({title: "About", route: About})>
      <main>
        {switch title {
        | Some(title) => <h1> {title->React.string} </h1>
        | None => React.null
        }}
        {switch intro {
        | Some(intro) =>
          <div className="serif" dangerouslySetInnerHTML={"__html": intro} />
        | None => React.null
        }}
        {switch body {
        | Some(body) =>
          <div className="serif" dangerouslySetInnerHTML={"__html": body} />
        | None => React.null
        }}
      </main>
      <aside>
        <Subscribe />
      </aside>
    </Layout>
  | _ => <Page_404 />
  }
