%raw
{|import { graphql } from "gatsby"|};

open QueryFragments;

[%graphql
  {|
    query IndexEntries {
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
      }
      strings: dataYaml(page: {eq: STRINGS}) {
        archive_link
      }
    }
|};
  {inline: true}
];

[@react.component]
let default = (~data) => {
  let data = parse(data);
  <Layout title=Site route=Index>
    {data.allPost.nodes
     ->Array.mapWithIndex(
         (
           index,
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
                 className="index-page__body"
                 dangerouslySetInnerHTML={"__html": html}
               />
             | Some(`UnspecifiedFragment(_))
             | Some(`MarkdownRemark(_))
             | None => React.null
             }
           }
           route={Entry({year, month, slug})}
           title
           heroImage={
             switch (heroImage) {
             | Some({
                 alt,
                 image: Some({sharp: Some({fluid: Some(fluid)})}),
                 _,
               }) =>
               Entry.Image.make(
                 ~alt?,
                 [|Gatsby.Img.Fluid.makeWithWebpSvg(fluid)|],
                 switch (index) {
                 | 0 => AboveFold
                 | _ => BelowFold
                 },
               )
             | _ => Entry.Image.empty
             }
           }
           imageCaption={
             switch (heroImage) {
             | Some({caption, _}) => caption
             | _ => None
             }
           }
           linkedHeader=Linked
           isoDate
           date
           draft
           footer={
             <footer>
               {switch (externalLink) {
                | Some(href) => <Entry.OriginalLink href />
                | None => React.null
                }}
               <hr className="index-page__separator" />
             </footer>
           }
         />
       )
     ->React.array}
    {switch (data.strings) {
     | Some({archive_link: Some(text)}) =>
       <div className="index-page__archive-link">
         <Router.Link route={Archive(1)}> text->React.string </Router.Link>
       </div>
     | _ => React.null
     }}
  </Layout>;
};
