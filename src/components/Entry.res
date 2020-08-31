%%raw(`import { graphql } from "gatsby"`)

let styles = Gatsby.importCss("./Entry.module.css")

%graphql(`
  query {
    strings: dataYaml(page: {eq: STRINGS}) {
      open_linked
    }
  }
`)

module OriginalLink = {
  @react.component
  let make = (~href, ~className="") => {
    let data = query->Gatsby.useStaticQueryUnsafe->parse
    <div
      className={Cn.fromList(list{styles["link"], className})}>
      <a href target="_blank" rel="noopener">
        {switch data {
        | {strings: Some({open_linked: Some(text)})} => text->React.string
        | _ => React.null
        }}
        <span ariaHidden=true> <Icons.ExternalLink className="icon" /> </span>
      </a>
    </div>
  }
}

module Date = {
  @react.component
  let make = (~date, ~isoDate) =>
    <time dateTime=isoDate className={styles["date"]}>
      <span ariaHidden=true> <Icons.Calendar className="icon" /> </span>
      {date->React.string}
    </time>
}

module DraftNotice = {
  @react.component
  let make = () =>
    <div className={styles["draft"]}>
      {"This is a draft. It will not appear in the published site."
      ->React.string}
    </div>
}

type linked =
  | Linked
  | Unlinked

module Image = {
  type position =
    | AboveFold
    | BelowFold

  type t = option<React.element>

  let empty = None

  let make = (~alt="Cover image.", fluid, position) => {
    let fadeIn = switch position {
    | AboveFold => false
    | BelowFold => true
    }
    let loading = switch position {
    | AboveFold => #auto
    | BelowFold => #\"lazy"
    }
    Some(<Gatsby.Img fluid alt fadeIn loading />)
  }
}

@react.component
let make = (
  ~body,
  ~url,
  ~title,
  ~linkedHeader,
  ~heroImage,
  ~imageCaption,
  ~isoDate,
  ~date,
  ~draft,
  ~footer,
  ~className="",
) => {
  let titleEl = switch linkedHeader {
  | Linked =>
    <Router.Link to_=url className={styles["headerLink"]}>
      {title->React.string}
    </Router.Link>
  | Unlinked => title->React.string
  }
  <article
    className={Cn.fromList(list{styles["article"], className})}>
    {switch heroImage {
    | Some(img) =>
      <figure className="full-bleed">
        {switch linkedHeader {
        | Linked => <Router.Link to_=url tabIndex={-1}> img </Router.Link>
        | Unlinked => img
        }}
        {switch imageCaption {
        | Some(text) =>
          <figcaption className={styles["caption"]}>
            {text->React.string}
          </figcaption>
        | None => React.null
        }}
      </figure>
    | None => React.null
    }}
    <div className={styles["body"]}>
      <header className={styles["header"]}>
        <h1 className={styles["title"]}> titleEl </h1>
        <Date date isoDate />
        {if draft {
          <DraftNotice />
        } else {
          React.null
        }}
      </header>
      body
      footer
    </div>
  </article>
}
