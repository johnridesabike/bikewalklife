[@react.component]
let default = () => {
  SiteMetadata.(
    switch (useQuery()) {
    | {
        site:
          Some({
            siteMetadata: {
              feedUrl,
              aboutData: {title, description, contact: {email}},
              _,
            },
          }),
      } =>
      <Layout title={String("About")}>
        <h1> title->React.string </h1>
        <div
          className="serif"
          dangerouslySetInnerHTML={"__html": description}
        />
        <dl className="ui-font font-size-small">
          <dt> "Email"->React.string </dt>
          <dd> <a href={"mailto:" ++ email}> email->React.string </a> </dd>
          <dt> "Feed"->React.string </dt>
          <dd> <a href=feedUrl> "RSS"->React.string </a> </dd>
        </dl>
      </Layout>
    | _ => React.null
    }
  );
};
