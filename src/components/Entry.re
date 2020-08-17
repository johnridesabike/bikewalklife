%raw
{|import { graphql } from "gatsby"|};

let styles = Gatsby.importCss("./Entry.module.css");

[%graphql
  {|
  query {
    strings: dataYaml(page: {eq: STRINGS}) {
      open_linked
    }
  }
|}
];

module OriginalLink = {
  [@react.component]
  let make = (~href, ~className="") => {
    let data = query->Gatsby.useStaticQueryUnsafe->parse;
    <div className=Cn.(styles##link <:> className)>
      <a href target="_blank" rel="noopener">
        {switch (data) {
         | {strings: Some({open_linked: Some(text)})} => text->React.string
         | _ => React.null
         }}
        <span ariaHidden=true> <Icons.ExternalLink className="icon" /> </span>
      </a>
    </div>;
  };
};

module Date = {
  [@react.component]
  let make = (~date, ~isoDate) =>
    <time dateTime=isoDate className=styles##date>
      <span ariaHidden=true> <Icons.Calendar className="icon" /> </span>
      date->React.string
    </time>;
};

module DraftNotice = {
  [@react.component]
  let make = () =>
    <div className=styles##draft>
      "This is a draft. It will not appear in the published site."
      ->React.string
    </div>;
};

type image =
  | NoImage
  | Image(array(Gatsby.Img.Fluid.t), string)
  | ImageNoAlt(array(Gatsby.Img.Fluid.t));

type linked =
  | Linked
  | Unlinked;

[@react.component]
let make =
    (
      ~body,
      ~url,
      ~title,
      ~linkedHeader,
      ~hero_image,
      ~imageCaption,
      ~isoDate,
      ~date,
      ~draft,
      ~footer,
      ~className="",
    ) => {
  let img =
    switch (hero_image) {
    | NoImage => None
    | Image(fluid, alt) => Some(<Gatsby.Img fluid alt />)
    | ImageNoAlt(fluid) => Some(<Gatsby.Img fluid alt="Cover image" />)
    };
  let titleEl =
    switch (linkedHeader) {
    | Linked =>
      <Router.Link to_=url className=styles##headerLink>
        title->React.string
      </Router.Link>
    | Unlinked => title->React.string
    };
  <article className=Cn.(styles##article <:> className)>
    {switch (img) {
     | Some(img) =>
       <figure className="full-bleed">
         {switch (linkedHeader) {
          | Linked => <Router.Link to_=url tabIndex=(-1)> img </Router.Link>
          | Unlinked => img
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
        {if (draft) {
           <DraftNotice />;
         } else {
           React.null;
         }}
      </header>
      body
      footer
    </div>
  </article>;
};
