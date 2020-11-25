@react.component
let make = (~className="") => {
  let {title, feedUrl, _} = QuerySiteMetadata.use()
  let strings = QueryStrings.use()
  <section className={Cn.append("subscribe ui-font", className)}>
    <h2 className="subscribe__heading font-size-xlarge">
      {"Subscribe to "->React.string}
      {title->React.string}
      <span ariaHidden=true> {` 📡`->React.string} </span>
    </h2>
    <dl className="font-size-small subscribe__list">
      <div>
        <dt> {"Feed"->React.string} </dt>
        <dd>
          <a href=feedUrl>
            <span ariaHidden=true> <Icons.Rss className="icon" /> </span> {"RSS"->React.string}
          </a>
        </dd>
        {switch strings.subscribe_feed_cta {
        | Some(text) => <dd dangerouslySetInnerHTML={"__html": text} />
        | None => React.null
        }}
      </div>
      <div>
        <dt> {"Email newsletter"->React.string} </dt>
        <dd>
          <a href="https://mailchi.mp/8215c6ef46cd/bike-walk-life-digest">
            <span ariaHidden=true> <Icons.Mail className="icon" /> </span>
            {"Subscribe"->React.string}
          </a>
        </dd>
        {switch strings.subscribe_email_cta {
        | Some(text) => <dd dangerouslySetInnerHTML={"__html": text} />
        | None => React.null
        }}
      </div>
    </dl>
  </section>
}
