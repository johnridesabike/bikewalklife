%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query ArchiveQuery($skip: Int!, $limit: Int!) @ppxConfig(inline: true) {
    allPost(
      sort: {fields: [date], order: [DESC]},
      limit: $limit,
      skip: $skip,
      filter: {published: {eq: true}}
    ) {
      nodes {
        id
        slug
        year
        month
        title
        externalLink
        isoDate: date @ppxCustom(module: "DateTime")
        date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
        draft
      }
      pageInfo {
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
  `
)

type pageContext = t_variables = {
  skip: int,
  limit: int,
}

@react.component
let default = (
  ~data as {
    Raw.allPost: {
      nodes,
      pageInfo: {currentPage, hasNextPage, hasPreviousPage}
    }
  },
) =>
  <Layout
    title={switch currentPage {
    | 1 => String("Archive")
    | currentPage => String("Archive page " ++ Int.toString(currentPage))
    }}
    route=Archive(currentPage)>
    <h1 className="archive__page-title"> {"Archive"->React.string} </h1>
    {nodes
    ->Array.map(
      ({id, title, externalLink, date, isoDate, draft, slug, year, month}) =>
        <div key=id className="archive__entry">
          <Router.Link
            route=Entry({year: year, month: month, slug: slug})
            className="archive__entry-title">
            {title->React.string}
          </Router.Link>
          <Entry.Date
            date={DateTime.parse(date)}
            isoDate={DateTime.parse(isoDate)} />
          {if draft {
            <div className="entry__draft"> {"Draft"->React.string} </div>
          } else {
            React.null
          }}
          {switch Js.Nullable.toOption(externalLink) {
          | Some(href) => <Entry.OriginalLink href />
          | None => React.null
          }}
        </div>
    )
    ->React.array}
    {if hasPreviousPage || hasNextPage {
      <div className="archive__nav-title">
        {"Page "->React.string}
        {currentPage->React.int}
      </div>
    } else {
      React.null
    }}
    <nav className="archive__nav">
      <div>
        {if hasPreviousPage {
          <Router.Link route=Archive(currentPage - 1)>
            <span ariaHidden=true> <Icons.ArrowLeft className="icon" /> </span>
            {"previous"->React.string}
          </Router.Link>
        } else {
          React.null
        }}
      </div>
      <div>
        {if hasNextPage {
          <Router.Link route=Archive(currentPage + 1)>
            {"next"->React.string}
            <span ariaHidden=true> <Icons.ArrowRight className="icon" /> </span>
          </Router.Link>
        } else {
          React.null
        }}
      </div>
    </nav>
  </Layout>
