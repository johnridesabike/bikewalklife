[@react.component]
let default = () =>
  switch (SiteMetadata.useQuery()) {
  | {site: Some({siteMetadata: {siteUrl, _}})} =>
    <Layout title={String("Search")}>
      <div style={ReactDOMRe.Style.make(~margin="3em 0", ())}>
        <h1 style={ReactDOMRe.Style.make(~textAlign="center", ())}>
          "Search"->React.string
        </h1>
        <iframe
          src={
            "https://duckduckgo.com/search.html?width=256&site="
            ++ Web.Url.make(siteUrl, ())->Web.Url.hostname
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
