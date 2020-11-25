@react.component
let default = () => {
  let siteMetadata = QuerySiteMetadata.use()
  <Layout metadata=Title({title: "Search", route: Search})>
    <main style={ReactDOMRe.Style.make(~margin="3em 0", ())}>
      <h1 style={ReactDOMRe.Style.make(~textAlign="center", ())}> {"Search"->React.string} </h1>
      <iframe
        src={"https://duckduckgo.com/search.html?width=256&site=" ++
        (Externals.Url.make(siteMetadata.siteUrl)["hostname"] ++
        "&prefill=Search with DuckDuckGo&focus=yes")}
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
    </main>
  </Layout>
}
