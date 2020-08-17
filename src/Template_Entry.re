%raw
{|import { graphql } from "gatsby"|};

open QueryFragments;

[%graphql
  {|
  query($slug: String!, $year: Int!, $month: Int!) {
    post(
      slug: { eq: $slug },
      year: { eq: $year },
      month: { eq: $month }
    ) {
      title
      externalLink
      isoDate: date  @ppxCustom(module: "DateTime")
      date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
      draft
      heroImage {
        alt
        caption
        image {
          ...HeroImage
        }
      }
      parent {
        ... on MarkdownRemark {
          __typename
          html
        }
      }
    }
    site {
      siteMetadata {
        siteTitle: title
        siteUrl
      }
    }
    about: dataYaml(page: {eq: ABOUT}) {
      intro
    }
    strings: dataYaml(page: {eq: STRINGS}) {
      contact_text
    }
  }
|}
];

module Neighbor = {
  type t = {
    year: int,
    month: int,
    slug: string,
    title: string,
  };
};

type pageContext = {
  slug: string,
  year: int,
  month: int,
  next: option(Neighbor.t),
  previous: option(Neighbor.t),
};

let styles = Gatsby.importCss("./Template_Entry.module.css");

module About = {
  [@react.component]
  let make = (~title, ~description, ~strings) =>
    <div className=styles##about>
      <h2 className=styles##aboutHeading>
        {"About " ++ title |> React.string}
      </h2>
      <div
        className=styles##aboutContent
        dangerouslySetInnerHTML={"__html": description}
      />
      <p className=styles##aboutLink>
        <Router.Link to_=About>
          {"read more about " ++ title |> React.string}
          <span ariaHidden=true> <Icons.ArrowRight className="icon" /> </span>
        </Router.Link>
      </p>
      {switch (strings) {
       | Some({contact_text: Some(text)}) =>
         <>
           <div
             className=styles##aboutContent
             dangerouslySetInnerHTML={"__html": text}
           />
           <p className=styles##aboutLink>
             <Router.Link to_=Contact>
               "Contact"->React.string
               <span ariaHidden=true>
                 <Icons.ArrowRight className="icon" />
               </span>
             </Router.Link>
           </p>
         </>
       | _ => React.null
       }}
    </div>;
};

[@react.component]
let default = (~data, ~pageContext as {slug, year, month, previous, next}) =>
  switch (parse(data)) {
  | {
      post:
        Some({
          heroImage,
          title,
          date,
          isoDate,
          draft,
          externalLink,
          parent: Some(`MarkdownRemark({html: Some(html), _})),
        }),
      site: Some({siteMetadata: {siteTitle, siteUrl}}),
      about,
      strings,
    } =>
    <Layout title={String(title)} route={Entry({year, month, slug})}>
      <BsReactHelmet>
        {switch (heroImage) {
         | Some({
             image: Some({sharp: Some({fluid: Some({src, _}), _})}),
             _,
           }) =>
           <meta
             property="og:image"
             content=Webapi.Url.(makeWith(src, ~base=siteUrl)->href)
           />
         | _ => React.null
         }}
        {switch (heroImage) {
         | Some({alt: Some(alt), _}) =>
           <meta name="twitter:image:alt" content=alt />
         | _ => React.null
         }}
      </BsReactHelmet>
      <Entry
        body={<div dangerouslySetInnerHTML={"__html": html} />}
        url={Entry({year, month, slug})}
        hero_image={
          switch (heroImage) {
          | Some({
              alt,
              image: Some({sharp: Some({fluid: Some(fluid)})}),
              _,
            }) =>
            let image = Gatsby.Img.Fluid.makeWithWebpSvg(fluid);
            switch (alt) {
            | Some(alt) => Image([|image|], alt)
            | None => ImageNoAlt([|image|])
            };
          | _ => NoImage
          }
        }
        imageCaption={
          switch (heroImage) {
          | Some({caption, _}) => caption
          | _ => None
          }
        }
        title
        linkedHeader=Unlinked
        isoDate
        date
        draft
        footer={
          <footer className=styles##footer>
            {switch (externalLink) {
             | Some(href) => <Entry.OriginalLink href />
             | None => React.null
             }}
            {switch (about) {
             | Some({intro: Some(intro)}) =>
               <About title=siteTitle description=intro strings />
             | _ => React.null
             }}
            <h2 className=styles##morePosts>
              "More recent posts"->React.string
            </h2>
            <nav>
              <ul className=styles##recentList>
                {switch (previous) {
                 | None => React.null
                 | Some({year, month, slug, title}) =>
                   <li className=styles##recentItem>
                     <Router.Link
                       to_={Entry({year, month, slug})}
                       className=styles##recentLink>
                       <span ariaHidden=true>
                         <Icons.ArrowLeft
                           className=Cn.("icon" <:> styles##arrow)
                         />
                       </span>
                       <span>
                         <Externals.VisuallyHidden>
                           "Previous post: "->React.string
                         </Externals.VisuallyHidden>
                         title->React.string
                       </span>
                     </Router.Link>
                   </li>
                 }}
                {switch (next) {
                 | None => React.null
                 | Some({year, month, slug, title}) =>
                   <li className=styles##recentItem>
                     <Router.Link
                       to_={Entry({year, month, slug})}
                       className=styles##recentLink
                       style={ReactDOMRe.Style.make(
                         ~justifyContent="flex-end",
                         (),
                       )}>
                       <span
                         style={ReactDOMRe.Style.make(~textAlign="right", ())}>
                         <Externals.VisuallyHidden>
                           "Next post: "->React.string
                         </Externals.VisuallyHidden>
                         title->React.string
                       </span>
                       <span ariaHidden=true>
                         <Icons.ArrowRight
                           className=Cn.("icon" <:> styles##arrow)
                         />
                       </span>
                     </Router.Link>
                   </li>
                 }}
              </ul>
            </nav>
          </footer>
        }
      />
    </Layout>
  | {
      post:
        Some({
          parent: Some(`MarkdownRemark(_) | `UnspecifiedFragment(_)) | None,
          _,
        }) |
        None,
      _,
    } =>
    <Page_404 />
  };
