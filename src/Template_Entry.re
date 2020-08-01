%raw
"import { graphql } from 'gatsby'";

open Fragments;

[%graphql
  {|
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        link
        isoDate: date  @ppxCustom(module: "DateTime")
        date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
        hero_image {
          alt
          caption
          image {
            childImageSharp {
              ...HeroImage
            }
          }
        }
      }
      html
    }
  }
|}
];

module Neighbor = {
  type t = {
    slug: string,
    title: string,
  };
};

type pageContext = {
  slug: string,
  next: option(Neighbor.t),
  previous: option(Neighbor.t),
};

let styles = Gatsby.importCss("./Template_Entry.module.css");

module About = {
  [@react.component]
  let make =
      (
        ~site as {
          SiteMetadata.siteMetadata: {title, aboutData: {description, _}, _},
        },
      ) =>
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
    </div>;
};

[@react.component]
let default = (~data, ~pageContext as {slug, previous, next}) =>
  switch (parse(data)) {
  | {
      markdownRemark:
        Some({
          html: Some(html),
          frontmatter: {hero_image, title, date, isoDate, link},
        }),
    } =>
    let SiteMetadata.{site} = SiteMetadata.useQuery();
    <Layout title={String(title)}>
      <BsReactHelmet>
        {switch (hero_image) {
         | Some({
             image:
               Some({childImageSharp: Some({mobile: Some({src, _}), _})}),
             _,
           }) =>
           <meta property="og:image" content=src />
         | _ => React.null
         }}
        {switch (hero_image) {
         | Some({alt: Some(alt), _}) =>
           <meta name="twitter:image:alt" content=alt />
         | _ => React.null
         }}
        {switch (site) {
         | Some({siteMetadata: {siteUrl, _}}) =>
           <meta
             property="og:url"
             content={
               Web.Url.make(
                 ~url=Router.toString(Entry(slug)),
                 ~base=siteUrl,
               )
               ->Web.Url.toString
             }
           />
         | None => React.null
         }}
      </BsReactHelmet>
      <Entry
        body={<div dangerouslySetInnerHTML={"__html": html} />}
        slug
        hero_image={
          switch (hero_image) {
          | Some({
              alt,
              image:
                Some({childImageSharp: Some({mobileSmall, mobile, full})}),
              _,
            }) =>
            let fluid =
              Array.keepMap(
                [|
                  (mobileSmall, "(max-width: 414px)"),
                  (mobile, "(max-width: 600px)"),
                  (full, "(min-width: 600px)"),
                |],
                ((fluid, media)) =>
                switch (fluid) {
                | Some(fluid) => Some(Gatsby.Img.Fluid.make(fluid, media))
                | None => None
                }
              );
            switch (alt) {
            | Some(alt) => `Image((fluid, alt))
            | None => `ImageNoAlt(fluid)
            };
          | _ => `NoImage
          }
        }
        imageCaption={
          switch (hero_image) {
          | Some({caption, _}) => caption
          | _ => None
          }
        }
        title
        linkedHeader=`Unlinked
        isoDate
        date
        footer={
          <footer className=styles##footer>
            {switch (link) {
             | Some(href) => <Entry.OriginalLink href />
             | None => React.null
             }}
            {switch (site) {
             | Some(site) => <About site />
             | None => React.null
             }}
            <h2 className=styles##morePosts>
              "More recent posts"->React.string
            </h2>
            <nav>
              <ul className=styles##recentList>
                {switch (previous) {
                 | None => React.null
                 | Some({slug, title}) =>
                   <li className=styles##recentItem>
                     <Router.Link
                       to_={Entry(slug)} className=styles##recentLink>
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
                 | Some({slug, title}) =>
                   <li className=styles##recentItem>
                     <Router.Link
                       to_={Entry(slug)}
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
    </Layout>;

  | _ => React.null
  };
