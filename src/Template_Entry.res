%%raw(`import { graphql } from "gatsby"`)

%graphql(`
  query EntryQuery(
    $slug: String!,
    $year: Int!,
    $month: Int!
  ) @ppxConfig(inline: true) {
    post(
      slug: {eq: $slug},
      year: {eq: $year},
      month: {eq: $month}
    ) {
      title
      externalLink
      isoDate: date @ppxCustom(module: "DateTime")
      date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
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
          excerpt(pruneLength: 140)
        }
      }
      related(limit: 8) {
        id
        title
        year
        month
        slug
        isoDate: date @ppxCustom(module: "DateTime")
        date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
      }
    }
    about: file(
      sourceInstanceName: {eq: "pages"},
      relativePath: {eq: "about.md"}
    ) {
      childMarkdownRemark {
        frontmatter {
          intro
          avatar: image_small {
            alt
            image {
              relativePath
            }
          }
        }
      }
    }
  }
  `)

module Neighbor = {
  type t = {
    year: int,
    month: int,
    slug: string,
    title: string,
  }
}

type pageContext = {
  slug: string,
  year: int,
  month: int,
  next: option<Neighbor.t>,
  previous: option<Neighbor.t>,
}

module About = {
  @react.component
  let make = (~description, ~avatar: option<t_about_childMarkdownRemark_frontmatter_avatar>) => {
    let siteMetadata = QuerySiteMetadata.use()
    let strings = QueryStrings.use()
    <section className="entry-page__about">
      <h2 className="entry-page__footer-heading">
        {"About " ++ siteMetadata.title |> React.string}
      </h2>
      <div className="entry-page__about-wrapper">
        {switch avatar {
        | Some({image: Some({relativePath}), alt}) =>
          <div className="entry-page__avatar-wrapper">
            <div
              className="entry-page__avatar"
              style={ReactDOMStyle.make(~width="120px", ~height="120px", ())}>
              <img
                src={"https://res.cloudinary.com/bike-walk-life/image/upload/c_fill,g_center,h_120,w_120/v1608060004/" ++
                relativePath}
                srcSet={`
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_center%2Ch_120%2Cw_120/v1608060004/${relativePath} 1x,
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_center%2Ch_180%2Cw_180/v1608060004/${relativePath} 1x,
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_center%2Ch_240%2Cw_240/v1608060004/${relativePath} 2x
                 `}
                ?alt
                height="120"
                width="120"
              />
            </div>
          </div>
        | _ => React.null
        }}
        <div
          className="entry-page__about-content" dangerouslySetInnerHTML={"__html": description}
        />
      </div>
      <p className="entry-page__about-link">
        <Router.Link route=About>
          {"Read more about " ++ siteMetadata.title |> React.string}
          <span ariaHidden=true> <Icons.ArrowRight className="icon" /> </span>
        </Router.Link>
      </p>
      {switch strings.contact_text {
      | Some(text) => <>
          <h2 className="entry-page__footer-heading"> {"Leave a comment"->React.string} </h2>
          <div className="entry-page__about-content" dangerouslySetInnerHTML={"__html": text} />
          <p className="entry-page__about-link">
            <Router.Link route=Contact>
              {"Contact me"->React.string}
              <span ariaHidden=true> <Icons.ArrowRight className="icon" /> </span>
            </Router.Link>
          </p>
        </>
      | None => React.null
      }}
    </section>
  }
}

@react.component
let default = (~data, ~pageContext as {slug, year, month, previous, next}) =>
  switch data->unsafe_fromJson->parse {
  | {
      post: Some({
        heroImage,
        title,
        date,
        isoDate,
        draft,
        author,
        externalLink,
        parent: Some(#MarkdownRemark({html: Some(html), excerpt: Some(excerpt)})),
        related,
      }),
      about,
    } =>
    <Layout
      metadata={Article({
        title: title,
        description: excerpt,
        author: author,
        date: isoDate,
        route: Entry({year: year, month: month, slug: slug}),
        image: switch heroImage {
        | Some({alt, image: Some({relativePath, _}), _}) =>
          Some({
            url: {
              "https://res.cloudinary.com/bike-walk-life/image/upload/c_fill,g_auto,h_450,w_900/v1608060004/" ++
              relativePath
            },
            alt: alt,
          })
        | _ => None
        },
      })}>
      <main>
        <Entry
          author
          html
          route=Entry({year: year, month: month, slug: slug})
          heroImage={switch heroImage {
          | Some({alt, image: Some({relativePath, _}), _}) =>
            Entry.Image.Image(
              <img
                src={"https://res.cloudinary.com/bike-walk-life/image/upload/c_fill,g_auto,h_450,w_900/v1608060004/" ++
                relativePath}
                srcSet={`
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cf_auto%2Cg_auto%2Ch_207%2Cw_404/v1608060004/${relativePath} 414w,
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cf_auto%2Cg_auto%2Ch_300%2Cw_600/v1608060004/${relativePath} 600w,
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cf_auto%2Cg_auto%2Ch_450%2Cw_900/v1608060004/${relativePath} 900w,
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cf_auto%2Cg_auto%2Ch_900%2Cw_1800/v1608060004/${relativePath} 1800w
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
          title
          linkedHeader=Unlinked
          isoDate
          date
          draft
          footer={<footer className="entry-page__footer">
            {switch externalLink {
            | Some(href) => <Entry.OriginalLink href />
            | None => React.null
            }}
          </footer>}
        />
      </main>
      <hr className="separator" />
      <aside className="ui-font">
        {switch about {
        | Some({childMarkdownRemark: Some({frontmatter: Some({intro: Some(intro), avatar})})}) =>
          <About description=intro avatar />
        | _ => React.null
        }}
        <hr className="separator" />
        <Subscribe />
      </aside>
      <hr className="separator" />
      <nav className="entry-page__nav">
        {switch related {
        | [] => React.null
        | related => <>
            <h2 className="entry-page__footer-header"> {"Related posts"->React.string} </h2>
            <ul className="entry-page__related-list">
              {related
              ->Array.map(({id, title, year, month, slug, date, isoDate}) =>
                <li className="entry-page__related-item" key=id>
                  <div>
                    <Router.Link route=Entry({year: year, month: month, slug: slug})>
                      {title->React.string}
                    </Router.Link>
                  </div>
                  <Entry.Date date isoDate />
                </li>
              )
              ->React.array}
            </ul>
            <hr className="separator" />
          </>
        }}
        <h2 className="entry-page__footer-heading"> {"Other recent posts"->React.string} </h2>
        <ul className="entry-page__recent-list">
          {switch previous {
          | None => React.null
          | Some({year, month, slug, title}) =>
            <li className="entry-page__recent-item">
              <Router.Link
                route=Entry({year: year, month: month, slug: slug})
                className="entry-page__recent-link">
                <span ariaHidden=true>
                  <Icons.ArrowLeft className="icon entry-page__arrow" />
                </span>
                <span>
                  <Externals.VisuallyHidden>
                    {"Previous post: "->React.string}
                  </Externals.VisuallyHidden>
                  {title->React.string}
                </span>
              </Router.Link>
            </li>
          }}
          {switch next {
          | None => React.null
          | Some({year, month, slug, title}) =>
            <li className="entry-page__recent-item">
              <Router.Link
                route=Entry({year: year, month: month, slug: slug})
                className="entry-page__recent-link"
                style={ReactDOMRe.Style.make(~justifyContent="flex-end", ())}>
                <span>
                  <Externals.VisuallyHidden>
                    {"Next post: "->React.string}
                  </Externals.VisuallyHidden>
                  {title->React.string}
                </span>
                <span ariaHidden=true>
                  <Icons.ArrowRight className="icon entry-page__arrow" />
                </span>
              </Router.Link>
            </li>
          }}
        </ul>
      </nav>
    </Layout>
  | {
      post: Some({parent: Some(#MarkdownRemark(_) | #UnspecifiedFragment(_)) | None, _}) | None,
      _,
    } =>
    <Page_404 />
  }
