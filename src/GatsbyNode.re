type parent;

type internal = {
  [@bs.as "type"]
  type_: string,
};

type frontmatter = {date: string};

type node = {
  internal,
  parent,
  frontmatter: option(frontmatter),
  fileAbsolutePath: string,
};

type fileNode = {relativePath: string};

type field;

[@bs.obj] external field: (~name: string, ~node: node, ~value: 'a) => field;

/* Each context type is defined inside page templates. */
[@unboxed]
type context =
  | Context('a): context;

type page = {
  component: string,
  context,
  mutable path: string,
};

type actions = {
  createNodeField: (. field) => unit,
  createPage: (. page) => unit,
  createTypes: (. string) => unit,
};

type graphqlResult('data) = {
  errors: option(Js.Exn.t),
  data: 'data,
};

type reporter = {panicOnBuild: (. string, Js.Exn.t) => unit};

type t('data) = {
  node,
  actions,
  getNode: (. parent) => fileNode,
  graphql: (. string) => Js.Promise.t(graphqlResult('data)),
  reporter,
};

let onCreateNode = ({node, actions: {createNodeField, _}, _}) =>
  switch (node) {
  | {
      internal: {type_: "MarkdownRemark"},
      frontmatter: Some({date}),
      fileAbsolutePath,
      _,
    } =>
    let date = Js.Date.fromString(date);
    let year = Js.Date.getFullYear(date);
    let month = Js.Date.getMonth(date) +. 1.0;
    let slug = NodeJs.Path.basenameExt(fileAbsolutePath, ".md");
    createNodeField(. field(~node, ~name="slug", ~value=slug));
    createNodeField(. field(~node, ~name="year", ~value=year));
    createNodeField(. field(~node, ~name="month", ~value=month));
  | _ => ()
  };

[%graphql
  {|
    query CreatePages {
      allMarkdownRemark(
        sort: {fields: [frontmatter___date], order: [DESC]},
        filter: {frontmatter: {published: {eq: true}}}
      ) {
        edges {
          node {
            fields {
              slug
              year
              month
            }
          }
          next {
            fields {
              slug
              year
              month
            }
              frontmatter {
              title
            }
          }
          previous {
            fields {
              slug
              year
              month
            }
            frontmatter {
              title
            }
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

let blogTemplate = NodeJs.Path.resolve([|"src", "Template_Entry.bs.js"|]);
let archiveTemplate =
  NodeJs.Path.resolve([|"src", "Template_Archive.bs.js"|]);

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
        | {
            allMarkdownRemark: {edges},
            site: Some({siteMetadata: {archivePerPage}}),
          } =>
          Array.forEach(
            edges,
            (
              {
                CreatePages.node: {fields: {slug, year, month}},
                next,
                previous,
              },
            ) =>
            createPage(. {
              component: blogTemplate,
              path: Router.toString(Entry({year, month, slug})),
              context:
                Context(
                  Template_Entry.{
                    slug,
                    year,
                    month,
                    next:
                      switch (next) {
                      | Some({
                          fields: {slug, year, month},
                          frontmatter: {title},
                        }) =>
                        Some({Neighbor.slug, year, month, title})
                      | None => None
                      },
                    previous:
                      switch (previous) {
                      | Some({
                          fields: {slug, year, month},
                          frontmatter: {title},
                        }) =>
                        Some({Neighbor.slug, year, month, title})
                      | None => None
                      },
                  },
                ),
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

let createSchemaCustomization = ({actions: {createTypes, _}, _}) =>
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
      published: Boolean!
      hero_image: HeroImage
    }
    type HeroImage {
      image: File @fileByRelativePath
      alt: String
      caption: String
    }
    type Fields {
      slug: String!
      year: Int!
      month: Int!
    }
    type Site {
      siteMetadata: SiteMetadata!
    }
    type SiteMetadata {
      title: String!
      description: String!
      siteUrl: String!
      archivePerPage: Int!
      feedUrl: String!
    }
    type DataYaml implements Node {
      page: YamlPageId
    }
    enum YamlPageId {
      ABOUT
      AUTHORS
      STRINGS
    }
  |},
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
