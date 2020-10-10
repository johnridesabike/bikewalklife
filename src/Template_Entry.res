%%raw(`import { graphql } from "gatsby"`)

open QueryFragments

%graphql(
  `
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
          ...HeroImage
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
        }
      }
    }
    avatar: file(name: {eq: "john-2020-closeup"}, sourceInstanceName: {eq: "images"}) {
      childImageSharp {
        fixed(width: 120, height: 120, cropFocus: CENTER) {
          ...ImageFixed_withWebp
        }
      }
    }
  }
  `
)

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
  let make = (~description, ~avatar) => {
    let siteMetadata = QuerySiteMetadata.use()
    let strings = QueryStrings.use()
    <section className="entry-page__about">
      <h2 className="entry-page__footer-heading">
        {"About " ++ siteMetadata.title |> React.string}
      </h2>
      <div className="entry-page__about-wrapper">
        {switch avatar {
        | Some({childImageSharp: Some({fixed})}) =>
          <div className="entry-page__avatar-wrapper">
            <Gatsby.Img
              fixed
              alt="A photograph of John."
              className="entry-page__avatar"
            />
          </div>
        | _ => React.null
        }}
        <div
          className="entry-page__about-content"
          dangerouslySetInnerHTML={"__html": description}
        />
      </div>
      <p className="entry-page__about-link">
        <Router.Link route=About>
          {"Read more about " ++ siteMetadata.title |> React.string}
          <span ariaHidden=true> <Icons.ArrowRight className="icon" /> </span>
        </Router.Link>
      </p>
      {switch strings.contact_text {
      | Some(text) =>
        <>
          <h2 className="entry-page__footer-heading">
            {"Leave a comment"->React.string}
          </h2>
          <div
            className="entry-page__about-content"
            dangerouslySetInnerHTML={"__html": text} />
          <p className="entry-page__about-link">
            <Router.Link route=Contact>
              {"Contact me"->React.string}
              <span ariaHidden=true>
                <Icons.ArrowRight className="icon" />
              </span>
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
      post:
        Some({
          heroImage,
          title,
          date,
          isoDate,
          draft,
          author,
          externalLink,
          parent: Some(
            #MarkdownRemark({
              html: Some(html),
              excerpt: Some(excerpt)
            })
          ),
          related,
        }),
      about,
      avatar,
    } =>
    <Layout
      metadata={
        Article({
          title,
          description: excerpt,
          author,
          date: isoDate,
          route: Entry({year, month, slug}),
          image: switch heroImage {
            | Some({
                alt,
                image: Some({sharp: Some({fluid: Some({src, _}), _})}),
                _
              }) =>
              Some({url: src, alt})
            | _ => None
          },
        })
      }>
      <main>
        <Entry
          html
          route=Entry({year, month, slug})
          heroImage={switch heroImage {
          | Some({alt, image: Some({sharp: Some({fluid: Some(fluid)})}), _}) =>
            Entry.Image.make(~alt?, fluid, AboveFold)
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
        | Some({
            childMarkdownRemark: Some({
              frontmatter: Some({intro: Some(intro)})
            })
          }) =>
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
            <h2 className="entry-page__footer-header">
              {"Related posts"->React.string}
            </h2>
            <ul className="entry-page__related-list">
              {related
              ->Array.map(({id, title, year, month, slug, date, isoDate}) =>
                <li className="entry-page__related-item" key=id>
                  <div>
                    <Router.Link route=Entry({year, month, slug})>
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
        <h2 className="entry-page__footer-heading">
          {"Other recent posts"->React.string}
        </h2>
        <ul className="entry-page__recent-list">
          {switch previous {
          | None => React.null
          | Some({year, month, slug, title}) =>
            <li className="entry-page__recent-item">
              <Router.Link
                route=Entry({year, month, slug})
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
                route=Entry({year, month, slug})
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
      post:
        Some({
          parent: Some(#MarkdownRemark(_) | #UnspecifiedFragment(_)) | None,
          _
        }) | None,
      _,
    } =>
    <Page_404 />
  }
