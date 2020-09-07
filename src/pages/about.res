%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query AboutPage @ppxConfig(inline: true) {
    site {
      siteMetadata {
        feedUrl
      }
    }
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
  switch parse(data) {
  | {
      site: Some({siteMetadata: {feedUrl}}),
      dataYaml: Some({title, intro, body})
    } =>
    <Layout title=String("About") route=About>
      <article>
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
        <h2> {"Subscribe"->React.string} </h2>
        <dl className="ui-font font-size-small">
          <dt> {"Feed"->React.string} </dt>
          <dd>
            <a href=feedUrl>
              <span ariaHidden=true>
                <Icons.Rss className="icon" />
              </span>
              {"RSS"->React.string}
            </a>
          </dd>
        </dl>
      </article>
    </Layout>
  | _ => <Page_404 />
  }
