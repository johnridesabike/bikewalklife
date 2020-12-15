%%raw(`import { graphql } from "gatsby"`)

%graphql(`
  query IndexEntries @ppxConfig(inline: true) {
    allPost(
      sort: {order: [DESC], fields: [date]},
      limit: 12,
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
        author
        heroImage {
          alt
          caption
          image {
            relativePath
          }
        }
        parent {
          ... on MarkdownRemark {
            html
          }
        }
      }
    }
  }
  `)

@react.component
let default = (~data) => {
  let data = data->unsafe_fromJson->parse
  let strings = QueryStrings.use()
  <Layout metadata=Default({route: Index})>
    <main>
      {data.allPost.nodes
      ->Array.mapWithIndex((
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
          author,
        },
      ) =>
        <React.Fragment key=id>
          <Entry
            author
            html={switch parent {
            | Some(#MarkdownRemark({html: Some(html)})) => html
            | Some(#UnspecifiedFragment(_) | #MarkdownRemark(_)) | None => ""
            }}
            route=Entry({year: year, month: month, slug: slug})
            title
            heroImage={switch heroImage {
            | Some({alt, image: Some({relativePath, _}), _}) =>
              Entry.Image.Image(
                <img
                  src={"https://res.cloudinary.com/bike-walk-life/image/upload/c_fill,g_auto,h_450,w_900/v1608060004/gatsby-cloudinary/" ++
                  relativePath}
                  srcSet={`
                https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_auto%2Ch_207%2Cw_404/v1608060004/gatsby-cloudinary/${relativePath} 414w,
                https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_auto%2Ch_300%2Cw_600/v1608060004/gatsby-cloudinary/${relativePath} 600w,
                https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_auto%2Ch_450%2Cw_900/v1608060004/gatsby-cloudinary/${relativePath} 900w,
                https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_auto%2Ch_900%2Cw_1800/v1608060004/gatsby-cloudinary/${relativePath} 1800w
                `}
                  sizes="(max-width: 900px) 100vw, 900px"
                  ?alt
                />,
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
            footer={<footer>
              {switch externalLink {
              | Some(href) => <Entry.OriginalLink href />
              | None => React.null
              }}
            </footer>}
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
      {switch strings.archive_link {
      | Some(text) =>
        <div className="index-page__archive-link">
          <Router.Link route=Archive(1)>
            {text->React.string}
            <span ariaHidden=true> <Icons.ArrowRight className="icon" /> </span>
          </Router.Link>
        </div>
      | None => React.null
      }}
    </nav>
    <hr className="separator" />
    <aside> <Subscribe /> </aside>
  </Layout>
}
