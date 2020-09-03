%%raw(`import { graphql } from "gatsby"`)

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
    <div className={Cn.append("entry__link", className)}>
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
    <time dateTime=isoDate className="entry__date">
      <span ariaHidden=true> <Icons.Calendar className="icon" /> </span>
      {date->React.string}
    </time>
}

module DraftNotice = {
  @react.component
  let make = () =>
    <div className="entry__draft">
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
    | AboveFold => #eager
    | BelowFold => #\"lazy"
    }
    Some(<Gatsby.Img fluid alt fadeIn loading />)
  }
}

@react.component
let make = (
  ~body,
  ~route,
  ~title,
  ~linkedHeader,
  ~heroImage,
  ~imageCaption,
  ~isoDate,
  ~date,
  ~draft,
  ~footer,
  ~className="",
) => 
  <article className={Cn.append("entry__article", className)}>
    {switch heroImage {
    | Some(img) =>
      <figure className="full-bleed">
        {switch linkedHeader {
        | Linked => <Router.Link route=route tabIndex={-1}> img </Router.Link>
        | Unlinked => img
        }}
        {switch imageCaption {
        | Some(text) =>
          <figcaption className="entry__caption">
            {text->React.string}
          </figcaption>
        | None => React.null
        }}
      </figure>
    | None => React.null
    }}
    <div className="entry__body">
      <header className="entry__header">
        <h1 className="entry__title">
          {switch linkedHeader {
          | Linked =>
            <Router.Link route=route className="entry__header-link">
              {title->React.string}
            </Router.Link>
          | Unlinked => title->React.string
          }}
        </h1>
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

