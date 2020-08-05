%raw
"import { graphql } from 'gatsby'";

[%graphql
  {|
  query {
    site {
      siteMetadata {
        siteUrl
      }
    }
  }
|}
];

[@react.component]
let default = (~data) =>
  switch (parse(data)) {
  | {site: Some({siteMetadata: {siteUrl}})} =>
    <Layout title={String("Search")} route=Search>
      <div style={ReactDOMRe.Style.make(~margin="3em 0", ())}>
        <h1 style={ReactDOMRe.Style.make(~textAlign="center", ())}>
          "Search"->React.string
        </h1>
        <iframe
          src={
            "https://duckduckgo.com/search.html?width=256&site="
            ++ Webapi.Url.make(siteUrl)->Webapi.Url.hostname
            ++ "&prefill=Search with DuckDuckGo&focus=yes"
          }
          style={ReactDOMRe.Style.make(
            ~overflow="hidden",
            ~margin="0",
            ~padding="0",
            ~width="324px",
            ~height="40px",
            ~marginLeft="auto",
            ~marginRight="auto",
            ~display="block",
            ~borderStyle="none",
            (),
          )}
        />
      </div>
    </Layout>
  | _ => React.null
  };
