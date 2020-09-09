%%raw(`import { graphql } from "gatsby"`)

open QueryFragments

%graphql(
  `
  query IndexEntries @ppxConfig(inline: true) {
    allPost(
      sort: {order: [DESC], fields: [date]},
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
  `
)

@react.component
let default = (~data) => {
  let data = data->unsafe_fromJson->parse
  <Layout title=Site route=Index>
    <main>
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
          }
        ) =>
        <React.Fragment key=id>
          <Entry
            body={switch parent {
            | Some(#MarkdownRemark({html: Some(html), _})) =>
              <div
                className="index-page__body"
                dangerouslySetInnerHTML={"__html": html} />
            | Some(#UnspecifiedFragment(_) | #MarkdownRemark(_)) | None =>
              React.null
            }}
            route=Entry({year: year, month: month, slug: slug})
            title
            heroImage={switch heroImage {
            | Some({alt, image: Some({sharp: Some({fluid: Some(fluid)})}), _}) =>
              Entry.Image.make(
                ~alt?,
                fluid,
                switch index {
                | 0 => AboveFold
                | _ => BelowFold
                },
              )
            | _ => Entry.Image.empty
            }}
            imageCaption={switch heroImage {
            | Some({caption, _}) => caption
            | _ => None
            }}
            linkedHeader=Linked
            isoDate
            date
            draft
            footer={
              <footer>
                {switch externalLink {
                | Some(href) => <Entry.OriginalLink href />
                | None => React.null
                }}
              </footer>
            }
          />
          {switch index {
          | 0 => 
            <div className="full-bleed">
              <hr className="separator" />
              <Subscribe className="small-screen-padding" />
              <hr className="separator" />
            </div>
          | _ => <hr className="separator" />
          }}
        </React.Fragment>
      )
      ->React.array}
    </main>
    <nav>
      {switch data.strings {
      | Some({archive_link: Some(text)}) =>
        <div className="index-page__archive-link">
          <Router.Link route=Archive(1)>
            {text->React.string}
            <span ariaHidden=true>
              <Icons.ArrowRight className="icon" />
            </span>
          </Router.Link>
        </div>
      | _ => React.null
      }}
    </nav>
    <hr className="separator" />
    <aside>
      <Subscribe />
    </aside>
  </Layout>
}
