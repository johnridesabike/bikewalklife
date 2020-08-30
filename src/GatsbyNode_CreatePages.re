/* Each context type is defined inside page templates. */
[@unboxed]
type context =
  | Context('a): context;

type page = {
  component: string,
  context,
  mutable path: string,
};

type actions = {createPage: (. page) => unit};

type graphqlResult('data) = {
  errors: option(Js.Exn.t),
  data: 'data,
};

type reporter = {panicOnBuild: (. string, Js.Exn.t) => unit};

type t('data) = {
  actions,
  graphql: (. string) => Js.Promise.t(graphqlResult('data)),
  reporter,
};

[%graphql
  {|
query CreatePages {
  allPost(
    filter: {published: {eq: true}},
    sort: {fields: [date], order: [DESC]}
  ) {
    edges {
      node {
        slug
        year
        month
      }
      next @ppxAs(type: "Template_Entry.Neighbor.t") {
        slug
        year
        month
        title
      }
      previous @ppxAs(type: "Template_Entry.Neighbor.t") {
        slug
        year
        month
        title
      }
    }
  }
  site {
    siteMetadata {
      archivePerPage
    }
  }
}
|};
  {taggedTemplate: false}
];

module Path = {
  [@bs.module "path"] [@bs.splice]
  external resolve: array(string) => string = "resolve";
};

let blogTemplate = Path.resolve([|"src", "Template_Entry.bs.js"|]);

let archiveTemplate = Path.resolve([|"src", "Template_Archive.bs.js"|]);

let createPages =
    ({graphql, actions: {createPage, _}, reporter: {panicOnBuild}, _}) =>
  graphql(. CreatePages.query)
  ->Promise.Js.fromBsPromise
  ->Promise.Js.tap(
      fun
      | {errors: Some(error), _} =>
        panicOnBuild(. "Error creating pages", error)
      | {data, errors: None} =>
        switch (CreatePages.parse(data)) {
        | {allPost: {edges}, site: Some({siteMetadata: {archivePerPage}})} =>
          Array.forEach(
            edges, ({CreatePages.node: {slug, year, month}, next, previous}) =>
            createPage(. {
              component: blogTemplate,
              path: Router.toString(Entry({year, month, slug})),
              context:
                Context({Template_Entry.slug, year, month, next, previous}),
            })
          );
          let numPages =
            Float.fromInt(Array.size(edges))
            /. Float.fromInt(archivePerPage)
            |> Js.Math.ceil_int;
          Range.forEach(0, numPages - 1, i =>
            createPage(. {
              path: Router.toString(Archive(i + 1)),
              component: archiveTemplate,
              context:
                Context(
                  Template_Archive.{
                    skip: i * archivePerPage,
                    limit: archivePerPage,
                  },
                ),
            })
          );
        | _ =>
          panicOnBuild(.
            "Error creating archive",
            Js.Exn.raiseError("createPages"),
          )
        },
    );

[@bs.val] [@bs.scope "Object"]
external clone: ([@bs.as {json|{}|json}] _, page) => page = "assign";

type pageActions = {
  deletePage: (. page) => unit,
  createPage: (. page) => unit,
};

type onCreatePage = {
  page,
  actions: pageActions,
};

/** Fix *.bs.js files for pages. */
let onCreatePage = ({page, actions: {deletePage, createPage}}) => {
  let oldPage = clone(page);
  page.path =
    Js.String2.replaceByRe(page.path, [%bs.re "/(\\/index\\.bs\\/)$/"], "/");
  if (page.path != oldPage.path) {
    deletePage(. oldPage);
    createPage(. page);
  } else {
    page.path =
      Js.String2.replaceByRe(page.path, [%bs.re "/(\\.bs\\/)$/"], "/");
    if (page.path != oldPage.path) {
      deletePage(. oldPage);
      createPage(. page);
    };
  };
};
