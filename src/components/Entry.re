let styles = Gatsby.importCss("./Entry.module.css");

module OriginalLink = {
  [@react.component]
  let make = (~href, ~className="") =>
    <div className=Cn.(styles##link <:> className)>
      <a href target="_blank" rel="noopener">
        "open linked page"->React.string
        <span ariaHidden=true> <Icons.ExternalLink className="icon" /> </span>
      </a>
    </div>;
};

module Date = {
  [@react.component]
  let make = (~date, ~isoDate) =>
    <time dateTime=isoDate className=styles##date>
      <span ariaHidden=true> <Icons.Calendar className="icon" /> </span>
      date->React.string
    </time>;
};

[@react.component]
let make =
    (
      ~body,
      ~slug,
      ~title,
      ~linkedHeader,
      ~hero_image,
      ~imageCaption,
      ~isoDate,
      ~date,
      ~footer,
      ~className="",
    ) => {
  let img =
    switch (hero_image) {
    | ([||], _) => None
    | (fluid, alt) => Some(<Gatsby.Img fluid alt />)
    };
  let titleEl =
    switch (linkedHeader) {
    | `Linked =>
      <Router.Link to_={Entry(slug)} className=styles##headerLink>
        title->React.string
      </Router.Link>
    | `Unlinked => title->React.string
    };
  <article className=Cn.(styles##article <:> className)>
    {switch (img) {
     | Some(img) =>
       <figure className="small-screen-full-bleed">
         {switch (linkedHeader) {
          | `Linked => <Router.Link to_={Entry(slug)}> img </Router.Link>
          | `Unlinked => img
          }}
         {switch (imageCaption) {
          | Some(text) =>
            <figcaption className=styles##caption>
              text->React.string
            </figcaption>
          | None => React.null
          }}
       </figure>
     | None => React.null
     }}
    <div className=styles##body>
      <header className=styles##header>
        <h1 className=styles##title> titleEl </h1>
        <Date date isoDate />
      </header>
      body
      footer
    </div>
  </article>;
};
