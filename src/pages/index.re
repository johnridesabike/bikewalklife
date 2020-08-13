%raw
"import { graphql } from 'gatsby'";

open Fragments;

[%graphql
  {|
    query Entries {
      allPost(
        sort: { order: [DESC], fields: [date] },
        limit: 24,
        filter: {published: {eq: true}}
      ) {
        nodes {
          id
          slug
          year
          month
          isoDate: date @ppxCustom(module: "DateTime")
          date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
          title
          externalLink
          draft
          heroImage {
            alt
            caption
            image {
              childImageSharp {
                ...HeroImage
              }
            }
          }
          parent {
            ... on MarkdownRemark {
              __typename
              html
            }
          }
        }
      }
      strings: dataYaml(page: {eq: STRINGS}) {
        archive_link
      }
    }
|};
  {inline: true}
];

let styles = Gatsby.importCss("./index.module.css");

[@react.component]
let default = (~data) => {
  let data = parse(data);
  <Layout title=Site route=Index>
    {data.allPost.nodes
     ->Array.map(
         (
           {
             id,
             slug,
             year,
             month,
             title,
             heroImage,
             isoDate,
             date,
             draft,
             externalLink,
             parent,
           },
         ) =>
         <Entry
           key=id
           body={
             switch (parent) {
             | Some(`MarkdownRemark({html: Some(html), _})) =>
               <div
                 className=styles##body
                 dangerouslySetInnerHTML={"__html": html}
               />
             | _ => React.null
             }
           }
           url={Entry({year, month, slug})}
           title
           hero_image={
             switch (heroImage) {
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
                     Some(Gatsby.Img.Fluid.makeWithWebpSvg(fluid, media))
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
             switch (heroImage) {
             | Some({caption, _}) => caption
             | _ => None
             }
           }
           linkedHeader=`Linked
           isoDate
           date
           draft
           footer={
             <footer>
               {switch (externalLink) {
                | Some(href) => <Entry.OriginalLink href />
                | None => React.null
                }}
               <hr className=styles##separator />
             </footer>
           }
         />
       )
     ->React.array}
    {switch (data.strings) {
     | Some({archive_link: Some(text)}) =>
       <div className=styles##archiveLink>
         <Router.Link to_={Archive(1)}> text->React.string </Router.Link>
       </div>
     | _ => React.null
     }}
  </Layout>;
};
