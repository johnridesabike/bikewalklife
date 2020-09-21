%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query SubscribeQuery @ppxConfig(inline: true, extend: "Gatsby.ExtendQuery") {
    site {
      siteMetadata {
        title
        feedUrl
      }
    }
    strings {
      subscribe_feed_cta
      subscribe_email_cta
    }
  }
  `
)

@react.component
let make = (~className="") =>
  switch query->useStaticQuery->parse {
  | {site: Some({siteMetadata: {title, feedUrl}}), strings} =>
    <section className={Cn.append("subscribe ui-font", className)}>
      <h2 className="subscribe__heading font-size-xlarge">
        {"Subscribe to "->React.string}
        {title->React.string}
        <span ariaHidden=true>
          {js` 📡`->React.string}
        </span>
      </h2>
      <dl className="font-size-small subscribe__list">
        <div>
          <dt> {"Feed"->React.string} </dt>
          <dd>
            <a href=feedUrl>
              <span ariaHidden=true>
                <Icons.Rss className="icon" />
              </span>
              {"RSS"->React.string}
            </a>
          </dd>
          {switch strings {
          | Some({subscribe_feed_cta: Some(text), _}) =>
            <dd dangerouslySetInnerHTML={"__html": text} />
          | _ => React.null
          }}
          </div>
          <div>
          <dt> {"Email newsletter"->React.string} </dt>
          <dd>
            <a href="https://mailchi.mp/8215c6ef46cd/bike-walk-life-digest">
              <span ariaHidden=true>
                <Icons.Mail className="icon" />
              </span>
              {"Subscribe"->React.string}
            </a>
          </dd>
          {switch strings {
          | Some({subscribe_email_cta: Some(text), _}) =>
            <dd dangerouslySetInnerHTML={"__html": text} />
          | _ => React.null
          }}
        </div>
      </dl> 
    </section>
  | _ => React.null
  }
