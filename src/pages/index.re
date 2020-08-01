%raw
"import { graphql } from 'gatsby'";

open Fragments;

[%graphql
  {|
    query Entries {
      allMarkdownRemark(
        sort: { order: [DESC], fields: [frontmatter___date] },
        limit: 24,
        filter: {frontmatter: {published: {eq: true}}}
      ) {
        edges {
          node {
            frontmatter {
              isoDate: date @ppxCustom(module: "DateTime")
              date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
              title
              link
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
            fields {
              slug
            }
          }
        }
      }
    }
|};
  {inline: true}
];

let styles = Gatsby.importCss("./index.module.css");

[@react.component]
let default = () => {
  let blogData = query->Gatsby.useStaticQueryUnsafe->parse;
  <Layout title=Site>
    {blogData.allMarkdownRemark.edges
     ->Array.map(
         (
           {
             node: {
               html,
               fields: {slug},
               frontmatter: {title, hero_image, isoDate, date, link},
             },
           },
         ) =>
         <Entry
           key=slug
           body={
             switch (html) {
             | Some(html) =>
               <div
                 className=styles##body
                 dangerouslySetInnerHTML={"__html": html}
               />
             | None => React.null
             }
           }
           slug
           title
           hero_image={
             switch (hero_image) {
             | Some({
                 alt,
                 image:
                   Some({
                     childImageSharp: Some({mobileSmall, mobile, full}),
                   }),
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
                     Some(Gatsby.Img.Fluid.make(fluid, media))
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
           linkedHeader=`Linked
           isoDate
           date
           footer={
             <footer>
               {switch (link) {
                | Some(href) => <Entry.OriginalLink href />
                | None => React.null
                }}
               <hr className=styles##separator />
             </footer>
           }
         />
       )
     ->React.array}
    <div className=styles##archiveLink>
      <Router.Link to_={Archive(1)}>
        "View the archive"->React.string
      </Router.Link>
    </div>
  </Layout>;
};
