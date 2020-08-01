module Rss = {
  /** https://www.npmjs.com/package/rss */
  [@unboxed]
  type customElement =
    | CustomElement(Js.t({..})): customElement;

  type enclosure;
  /*
   [@bs.obj]
   external enclosureUrl:
     (~url: string, ~size: int=?, ~type_: string=?, unit) => enclosure;
     */

  module Feed = {
    type options;
    [@bs.obj]
    external options:
      (
        ~title: string,
        ~description: string=?,
        ~generator: string=?,
        ~feed_url: string,
        ~site_url: string,
        ~image_url: string=?,
        ~docs: string=?,
        ~managingEditor: string=?,
        ~webMaster: string=?,
        ~copyright: string=?,
        ~language: string=?,
        ~categories: array(string)=?,
        ~pubDate: string=?,
        ~ttl: int=?,
        ~hub: string=?,
        ~custom_namespaces: Js.Dict.t(string)=?,
        ~custom_elements: array(customElement)=?,
        unit
      ) =>
      options;
  };

  module Item = {
    type options;
    [@bs.obj]
    external options:
      (
        ~title: string,
        ~description: string,
        ~url: string,
        ~guid: string,
        ~categories: array(string)=?,
        ~author: string=?,
        ~date: string,
        ~lat: float=?,
        ~long: float=?,
        ~custom_elements: array(customElement)=?,
        ~enclosure: enclosure=?,
        unit
      ) =>
      options;
  };
};

[@bs.val] external unsafeRequire: string => Js.t({..}) = "require";

let config = unsafeRequire("../../../config.json");

module PluginFeed = {
  [%graphql
    {|
    query Site {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
    }
  |};
    {taggedTemplate: false}
  ];

  [%graphql
    {|
    query AllMarkdown {
      allMarkdownRemark(
        sort: { order: [DESC], fields: [frontmatter___date] },
        filter: {frontmatter: {published: {eq: true}}}
      ) {
        edges {
          node {
            excerpt
            html
            fields {
              slug
            }
            frontmatter {
              title
              date @ppxCustom(module: "DateTime")
            }
          }
        }
      }
    }
  |};
    {taggedTemplate: false}
  ];

  /*
   let figure =
       (
         siteUrl,
         image:
           option(
             AllMarkdown.t_allMarkdownRemark_edges_node_frontmatter_hero_image,
           ),
       ) =>
     switch (image) {
     | Some({
         alt,
         caption,
         image: {childImageSharp: Some({fluid: Some({src, _}), _})},
       }) =>
       "<figure><img src=\""
       ++ Url.make(~url=src, ~base=siteUrl)->Url.toString
       ++ "\" alt=\""
       ++ alt
       ++ "\"/>"
       ++ {
         switch (caption) {
         | Some(caption) => "<figcaption>" ++ caption ++ "</figcaption>"
         | None => ""
         };
       }
       ++ "</figure>"
     | _ => ""
     };
     */

  type query('a) = {query: 'a};

  module Serialize = {
    module Raw = {
      /* This is the two queries merged together */
      type t;
    };
    let unsafeParse = query => (
      query->Obj.magic->Site.parse,
      query->Obj.magic->AllMarkdown.parse,
    );
  };

  module Feed = {
    type t = {
      query: string,
      serialize: query(Serialize.Raw.t) => array(Rss.Item.options),
      output: string,
      title: string,
    };
  };
  type t = {
    query: string,
    setup: query(Site.Raw.t) => Rss.Feed.options,
    feeds: array(Feed.t),
  };

  let options = {
    query: Site.query,
    setup: ({query}) => {
      switch (Site.parse(query).site) {
      | Some({siteMetadata: {title, description, siteUrl}}) =>
        Rss.Feed.options(
          ~title,
          ~description,
          ~site_url=siteUrl,
          ~feed_url=
            Web.Url.make(~url=config##feed_url, ~base=siteUrl)
            ->Web.Url.toString,
          (),
        )
      | None => failwith("PluginFeed.setup")
      };
    },
    feeds: [|
      {
        serialize: ({query}) => {
          let (Site.{site}, AllMarkdown.{allMarkdownRemark: {edges}}) =
            Serialize.unsafeParse(query);
          Array.map(
            edges,
            (
              {
                node: {
                  excerpt,
                  html,
                  fields: {slug},
                  frontmatter: {title, date},
                },
              },
            ) =>
            switch (site) {
            | Some({siteMetadata: {siteUrl: site_url, _}}) =>
              Rss.Item.options(
                ~title,
                ~description=
                  switch (excerpt) {
                  | Some(excerpt) => excerpt
                  | None => ""
                  },
                ~date,
                ~url=
                  Web.Url.make(~url=slug, ~base=site_url)->Web.Url.toString,
                ~guid=
                  Web.Url.make(~url=slug, ~base=site_url)->Web.Url.toString,
                ~custom_elements=
                  switch (html) {
                  | Some(html) => [|
                      Rss.CustomElement({"content:encoded": html}),
                    |]
                  | None => [||]
                  },
                (),
              )
            | None => failwith("PluginFeed.serialize")
            }
          );
        },
        query: AllMarkdown.query,
        output: config##feed_url,
        title: config##title,
      },
    |],
  };
};
