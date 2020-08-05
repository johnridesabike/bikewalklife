%raw
"import { graphql } from 'gatsby'";

[%graphql
  {|
  query blogListQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: [DESC] },
      limit: $limit,
      skip: $skip,
      filter: {frontmatter: {published: {eq: true}}}
    ) {
      edges {
        node {
          id
          fields {
            slug
            year
            month
          }
          frontmatter {
            title
            external_link
            isoDate: date @ppxCustom(module: "DateTime")
            date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
          }
        }
      }
      pageInfo {
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
|};
  {inline: true}
];

type pageContext =
  t_variables = {
    skip: int,
    limit: int,
  };

let styles = Gatsby.importCss("./Template_Archive.module.css");

[@react.component]
let default =
    (
      ~data as {
        Raw.allMarkdownRemark: {
          edges,
          pageInfo: {currentPage, hasNextPage, hasPreviousPage},
        },
      },
    ) => {
  <Layout
    title={
      switch (currentPage) {
      | 1 => String("Archive")
      | currentPage => String("Archive page " ++ Int.toString(currentPage))
      }
    }
    route={Archive(currentPage)}>
    <h1 className=styles##pageTitle> "Archive"->React.string </h1>
    {edges
     ->Array.map(
         (
           {
             node: {
               id,
               frontmatter: {title, external_link, date, isoDate},
               fields: {slug, year, month},
             },
           },
         ) => {
         <div key=id className=styles##entry>
           <Router.Link
             to_={Entry({year, month, slug})} className=styles##title>
             title->React.string
           </Router.Link>
           <Entry.Date
             date={DateTime.parse(date)}
             isoDate={DateTime.parse(isoDate)}
           />
           {switch (Js.Nullable.toOption(external_link)) {
            | Some(href) => <Entry.OriginalLink href />
            | None => React.null
            }}
         </div>
       })
     ->React.array}
    {if (hasPreviousPage || hasNextPage) {
       <div className=styles##navTitle>
         "Page "->React.string
         currentPage->React.int
       </div>;
     } else {
       React.null;
     }}
    <nav className=styles##nav>
      <div>
        {if (hasPreviousPage) {
           <Router.Link to_={Archive(currentPage - 1)}>
             <span ariaHidden=true>
               <Icons.ArrowLeft className="icon" />
             </span>
             "previous"->React.string
           </Router.Link>;
         } else {
           React.null;
         }}
      </div>
      <div>
        {if (hasNextPage) {
           <Router.Link to_={Archive(currentPage + 1)}>
             "next"->React.string
             <span ariaHidden=true>
               <Icons.ArrowRight className="icon" />
             </span>
           </Router.Link>;
         } else {
           React.null;
         }}
      </div>
    </nav>
  </Layout>;
};
