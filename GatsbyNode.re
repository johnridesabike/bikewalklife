type parent;

type internal = {
  [@bs.as "type"]
  type_: string,
};

type node = {
  internal,
  parent,
  fileAbsolutePath: string,
};

type fileNode = {relativePath: string};

type field = {
  name: string,
  node,
  value: string,
};

type page('context) = {
  component: string,
  context: Js.t('context),
  mutable path: string,
};

type actions('context) = {
  createNodeField: (. field) => unit,
  createPage: (. page('context)) => unit,
  createTypes: (. string) => unit,
};

type graphqlResult('data) = {
  errors: option(Js.Exn.t),
  data: 'data,
};

type reporter = {panicOnBuild: (. string, Js.Exn.t) => unit};

type t('context, 'data) = {
  node,
  actions: actions('context),
  getNode: (. parent) => fileNode,
  graphql: (. string) => Js.Promise.t(graphqlResult('data)),
  reporter,
};

let onCreateNode = ({node, actions: {createNodeField, _}, _}) =>
  switch (node) {
  | {internal: {type_: "MarkdownRemark"}, fileAbsolutePath, _} =>
    let slug = NodeJs.Path.basenameExt(fileAbsolutePath, ".md");
    createNodeField(. {node, name: "slug", value: slug});
  | _ => ()
  };

[%graphql
  {|
    query AllMarkdown {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
|};
  {taggedTemplate: false}
];

let createPages =
    ({graphql, actions: {createPage, _}, reporter: {panicOnBuild}, _}) => {
  let blogTemplate = NodeJs.Path.resolve([|"src", "Template_Blog.bs.js"|]);
  graphql(. AllMarkdown.query)
  ->Promise.Js.fromBsPromise
  ->Promise.Js.tap(
      fun
      | {errors: Some(error), _} =>
        panicOnBuild(. "Error creating pages", error)
      | {data: AllMarkdown.Raw.{allMarkdownRemark: {edges}}, errors: None} =>
        Array.forEach(edges, ({AllMarkdown.Raw.node: {fields: {slug}}}) =>
          createPage(. {
            component: blogTemplate,
            path: "/blog/" ++ slug,
            context: {
              "slug": slug,
            },
          })
        ),
    );
};

let createSchemaCustomization = ({actions: {createTypes, _}, _}) => {
  createTypes(.
    {|
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter!
      fields: Fields!
    }
    type Frontmatter {
      title: String!
      date: Date! @dateformat
      author: String!
    }
    type Fields {
      slug: String!
    }
  |},
  );
};


[@bs.val] [@bs.scope "Object"]
external clone: ([@bs.as {json|{}|json}] _, page('context)) => page('context) =
  "assign";

type pageActions('context) = {
  deletePage: (. page('context)) => unit,
  createPage: (. page('context)) => unit,
};

type onCreatePage('context) = {
  page: page('context),
  actions: pageActions('context),
};

/**
 * Fix *.bs.js files for pages.
 */
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
