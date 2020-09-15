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
        }
      }
      related {
        id
        title
        year
        month
        slug
        isoDate: date @ppxCustom(module: "DateTime")
        date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
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
  let make = (~title, ~description, ~strings) =>
    <section className="entry-page__about">
      <h2 className="entry-page__footer-heading">
        {"About " ++ title |> React.string}
      </h2>
      <div
        className="entry-page__about-content"
        dangerouslySetInnerHTML={"__html": description}
      />
      <p className="entry-page__about-link">
        <Router.Link route=About>
          {"read more about " ++ title |> React.string}
          <span ariaHidden=true> <Icons.ArrowRight className="icon" /> </span>
        </Router.Link>
      </p>
      {switch strings {
      | Some({contact_text: Some(text)}) => <>
          <div
            className="entry-page__about-content"
            dangerouslySetInnerHTML={"__html": text} />
          <p className="entry-page__about-link">
            <Router.Link route=Contact>
              {"Contact"->React.string}
              <span ariaHidden=true>
                <Icons.ArrowRight className="icon" />
              </span>
            </Router.Link>
          </p>
        </>
      | _ => React.null
      }}
    </section>
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
          externalLink,
          parent: Some(#MarkdownRemark({html: Some(html), _})),
          related,
        }),
      site: Some({siteMetadata: {siteTitle, siteUrl}}),
      about,
      strings,
    } =>
    <Layout title=String(title) route=Entry({year, month, slug})>
      {switch heroImage {
      | Some({
          alt,
          image: Some({sharp: Some({fluid: Some({src, _}), _})}),
          _
        }) =>
          <BsReactHelmet>
            <meta
              property="og:image"
              content={src->Webapi.Url.makeWith(~base=siteUrl)->Webapi.Url.href}
            />
            <meta name="twitter:card" content="summary_large_image"/ >
            {switch alt {
            | Some(alt) =>
              <meta name="twitter:image:alt" content=alt />
            | _ => React.null
            }}
          </BsReactHelmet>
      | _ =>
        <BsReactHelmet>
          <meta name="twitter:card" content="summary" />
        </BsReactHelmet>
      }}
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
        | Some({intro: Some(intro)}) =>
          <About title=siteTitle description=intro strings />
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
