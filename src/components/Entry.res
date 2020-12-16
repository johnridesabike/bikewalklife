module OriginalLink = {
  @react.component
  let make = (~href, ~className="") => {
    let strings = QueryStrings.use()
    <div className={Cn.append("entry__link", className)}>
      <a href target="_blank" rel="noopener">
        {switch strings.open_linked {
        | Some(text) => text->React.string
        | None => React.null
        }}
        <span ariaHidden=true> <Icons.ExternalLink className="icon" /> </span>
      </a>
    </div>
  }
}

module Date = {
  @react.component
  let make = (~date, ~isoDate) =>
    <time dateTime=isoDate className="dt-published entry__date">
      <span ariaHidden=true> <Icons.Calendar className="icon" /> </span> {date->React.string}
    </time>
}

module Author = {
  @react.component
  let make = (~name) =>
    <div className="entry__author">
      <span ariaHidden=true> <Icons.User className="icon" /> </span>
      <span className="entry__author-by"> {"by "->React.string} </span>
      <span className="p-author h-card"> {name->React.string} </span>
    </div>
}

module DraftNotice = {
  @react.component
  let make = () =>
    <div className="entry__draft">
      {"This is a draft. It will not appear in the published site."->React.string}
    </div>
}

module Image = {
  type position =
    | AboveFold
    | BelowFold

  type t =
    | NoImage
    | Image(React.element)

  let empty = NoImage

  /*
  let make = (~alt="Cover image.", fluid, position) => {
    let fadeIn = switch position {
    | AboveFold => false
    | BelowFold => true
    }
    let loading = switch position {
    | AboveFold => #eager
    | BelowFold => #\"lazy"
    }
    Image(<Gatsby.Img fluid alt fadeIn loading />)
  }
 */
}

type linked =
  | Linked
  | Unlinked

@react.component
let make = (
  ~html,
  ~route,
  ~title,
  ~linkedHeader,
  ~heroImage,
  ~imageCaption,
  ~isoDate,
  ~date,
  ~draft,
  ~footer,
  ~author,
  ~className="",
) =>
  <article className={Cn.append("h-entry hentry entry__article", className)}>
    {switch heroImage {
    | Image.Image(img) =>
      <figure className="full-bleed">
        {switch linkedHeader {
        | Linked => <Router.Link route tabIndex={-1}> img </Router.Link>
        | Unlinked => img
        }}
        {switch imageCaption {
        | Some(text) => <figcaption className="entry__caption"> {text->React.string} </figcaption>
        | None => React.null
        }}
      </figure>
    | NoImage => React.null
    }}
    <div className="entry__body">
      <header className="entry__header">
        <h1 className="p-name entry__title">
          {switch linkedHeader {
          | Linked =>
            <Router.Link route className="entry__header-link"> {title->React.string} </Router.Link>
          | Unlinked => title->React.string
          }}
        </h1>
        <Date date isoDate />
        <Author name=author />
        {if draft {
          <DraftNotice />
        } else {
          React.null
        }}
      </header>
      <div className="e-content" dangerouslySetInnerHTML={"__html": html} />
      footer
    </div>
  </article>
