[@react.component]
let make = () => {
  Query_SiteMetadata.(
    switch (useSiteMetadata()) {
    | {
        site:
          Some({
            siteMetadata:
              Some({
                infoData:
                  Some({
                    description: Some(description),
                    cta: Some(cta),
                    contact:
                      Some({
                        email: Some(email),
                        twitter_handle: Some(twitter_handle),
                        github_handle: Some(github_handle),
                      }),
                    _,
                  }),
                _,
              }),
          }),
      } =>
      <Layout page="info">
        <section>
          <h2>
            <div dangerouslySetInnerHTML={"__html": description} />
            <div dangerouslySetInnerHTML={"__html": cta} />
          </h2>
          <ul>
            <li>
              <p>
                <a href={"mailto:" ++ email}>
                  {"Email: " ++ email |> React.string}
                </a>
              </p>
            </li>
            <li>
              <p>
                <a href={"https://twitter.com/" ++ twitter_handle}>
                  {"Twitter: @" ++ twitter_handle |> React.string}
                </a>
              </p>
            </li>
            <li>
              <p>
                <a href={"https://github.com/" ++ github_handle}>
                  {"Github: " ++ github_handle |> React.string}
                </a>
              </p>
            </li>
          </ul>
        </section>
      </Layout>
    | _ => <Layout page="info"> "lol"->React.string </Layout>
    }
  );
};
let default = make;
