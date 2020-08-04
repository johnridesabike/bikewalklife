%raw
"import { graphql } from 'gatsby'";

open Fragments;

[%graphql
  {|
  query($slug: String!, $year: Int!, $month: Int!) {
    markdownRemark(
      fields: {
        slug: { eq: $slug },
        year: { eq: $year },
        month: { eq: $month }
      }
    ) {
      frontmatter {
        title
        external_link
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
    site {
      siteMetadata {
        siteTitle: title
        aboutData {
          description
        }
        siteUrl
      }
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
  let make = (~title, ~description) =>
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
let default = (~data, ~pageContext as {slug, year, month, previous, next}) =>
  switch (parse(data)) {
  | {
      markdownRemark:
        Some({
          html: Some(html),
          frontmatter: {hero_image, title, date, isoDate, external_link},
        }),
      site: Some({siteMetadata: {siteTitle, siteUrl, aboutData}}),
    } =>
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
        <meta
          property="og:url"
          content={
            Webapi.Url.makeWithBase(
              Router.toString(Entry({year, month, slug})),
              siteUrl,
            )
            ->Webapi.Url.href
          }
        />
      </BsReactHelmet>
      <Entry
        body={<div dangerouslySetInnerHTML={"__html": html} />}
        url={Entry({year, month, slug})}
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
                | Some(fluid) =>
                  Some(Gatsby.Img.Fluid.makeWithSVG(fluid, media))
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
            {switch (external_link) {
             | Some(href) => <Entry.OriginalLink href />
             | None => React.null
             }}
            <About title=siteTitle description={aboutData.description} />
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

  | _ => React.null
  };
