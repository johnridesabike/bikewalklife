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
        filter: {published: {eq: true}}
      ) {
        edges {
          node {
            excerpt
            html
            fields {
              slug
              year
              month
            }
            frontmatter {
              title
              date @ppxCustom(module: "DateTime")
              external_link
            }
          }
        }
      }
      strings: dataYaml(page: {eq: STRINGS}) {
        open_linked
      }
    }
  |};
    {taggedTemplate: false}
  ];

  let externalLink = (~strings, href) =>
    switch (href, strings) {
    | (Some(href), Some(AllMarkdown.{open_linked: Some(text)})) =>
      ReactDOMServer.renderToStaticMarkup(
        <p>
          <a href>
            text->React.string
            " "->React.string
            <span ariaHidden=true>
              <Icons.ExternalLink height=16 width=16 />
            </span>
          </a>
        </p>,
      )
    | _ => ""
    };

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
            Webapi.Url.makeWithBase(config##feed_url, siteUrl)
            ->Webapi.Url.href,
          ~image_url=
            Webapi.Url.makeWithBase("/icons/icon-96x96.png", siteUrl)
            ->Webapi.Url.href,
          (),
        )
      | None => failwith("PluginFeed.setup")
      };
    },
    feeds: [|
      {
        serialize: ({query}) => {
          let (
            Site.{site},
            AllMarkdown.{allMarkdownRemark: {edges}, strings},
          ) =
            Serialize.unsafeParse(query);
          Array.map(
            edges,
            (
              {
                node: {
                  excerpt,
                  html,
                  fields: {slug, year, month},
                  frontmatter: {title, date, external_link},
                },
              },
            ) =>
            switch (site) {
            | Some({siteMetadata: {siteUrl: site_url, _}}) =>
              let url =
                Router.toStringWithBase(
                  Entry({year, month, slug}),
                  site_url,
                );
              Rss.Item.options(
                ~title,
                ~description=
                  switch (excerpt) {
                  | Some(excerpt) => excerpt
                  | None => ""
                  },
                ~date,
                ~url,
                ~guid=url,
                ~custom_elements=
                  switch (html) {
                  | Some(html) => [|
                      Rss.CustomElement({
                        "content:encoded":
                          html ++ externalLink(~strings, external_link),
                      }),
                    |]
                  | None => [||]
                  },
                (),
              );
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

module PluginSiteMap = {
  [%graphql
    {|
    query SiteMap {
      site {
        siteMetadata {
          siteUrl
        }
      }
      allSitePage {
        edges {
          node {
            path
          }
        }
      }
    }
  |};
    {taggedTemplate: false}
  ];

  module Page = {
    type t;
    [@bs.obj]
    external make:
      (~url: string, ~changefreq: string=?, ~priority: float=?, unit) => t;
  };

  type t = {
    output: string,
    exclude: array(string),
    query: string,
    resolveSiteUrl: SiteMap.Raw.t => string,
    serialize: SiteMap.Raw.t => array(Page.t),
  };

  let options = {
    output: "/sitemap.xml",
    exclude: [||],
    query: SiteMap.query,
    resolveSiteUrl: query =>
      switch (SiteMap.parse(query)) {
      | {site: Some({siteMetadata: {siteUrl}}), _} => siteUrl
      | _ => failwith("Error building sitemap.")
      },
    serialize: query =>
      switch (SiteMap.parse(query)) {
      | {site: Some({siteMetadata: {siteUrl}}), allSitePage: {edges}} =>
        Array.map(edges, ({node: {path}}) =>
          Page.make(
            ~url=Webapi.Url.makeWithBase(path, siteUrl)->Webapi.Url.href,
            (),
          )
        )
      | _ => failwith("Error building sitemap.")
      },
  };
};
