[@react.component]
let default = () => {
  SiteMetadata.(
    switch (useQuery()) {
    | {
        site:
          Some({
            siteMetadata: {feedUrl, aboutData: {title, description}, _},
          }),
      } =>
      <Layout title={String("About")}>
        <article>
          <h1> title->React.string </h1>
          <div
            className="serif"
            dangerouslySetInnerHTML={"__html": description}
          />
          <h2> "Subscribe"->React.string </h2>
          <dl className="ui-font font-size-small">
            <dt> "Feed"->React.string </dt>
            <dd>
              <a href=feedUrl>
                <span ariaHidden=true> <Icons.Rss className="icon" /> </span>
                "RSS"->React.string
              </a>
            </dd>
          </dl>
          <h2> "Contact"->React.string </h2>
          <p className="ui-font">
            "Send tips, questions, comments, or just say \"hi.\""->React.string
          </p>
          <Contact />
        </article>
      </Layout>
    | _ => React.null
    }
  );
};
