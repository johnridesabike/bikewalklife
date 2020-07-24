[@react.component]
let make = (~page=?, ~children) => {
  switch (Query_SiteMetadata.useSiteMetadata()) {
  | {
      site:
        Some({
          siteMetadata:
            Some({title: Some(title), description: Some(description), _}),
        }),
    } =>
    <section>
      <BsReactHelmet>
        <html lang="en" />
        <title> title->React.string </title>
        <meta name="description" content=description />
      </BsReactHelmet>
      <Header ?page title />
      <div> children </div>
    </section>
  | _ => React.null
  };
};
let default = make;
