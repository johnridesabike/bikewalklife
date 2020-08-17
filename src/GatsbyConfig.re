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
    query AllPosts {
      allPost(
        sort: { order: [DESC], fields: [date] },
        filter: {published: {eq: true}}
        limit: 24,
      ) {
        nodes {
          slug
          year
          month
          title
          date @ppxCustom(module: "DateTime")
          externalLink
          parent {
            ... on MarkdownRemark {
              __typename
              excerpt
              html
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

  let renderLink = (~strings, href) =>
    switch (href, strings) {
    | (Some(href), Some(AllPosts.{open_linked: Some(text)})) =>
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
      query->Obj.magic->AllPosts.parse,
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
            Webapi.Url.makeWith(config##feed_url, ~base=siteUrl)
            ->Webapi.Url.href,
          ~image_url=
            Webapi.Url.makeWith("/icons/icon-96x96.png", ~base=siteUrl)
            ->Webapi.Url.href,
          (),
        )
      | None => failwith("PluginFeed.setup")
      };
    },
    feeds: [|
      {
        serialize: ({query}) => {
          let (Site.{site}, AllPosts.{allPost: {nodes}, strings}) =
            Serialize.unsafeParse(query);
          Array.map(
            nodes, ({slug, year, month, title, date, externalLink, parent}) =>
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
                  switch (parent) {
                  | Some(`MarkdownRemark({excerpt: Some(excerpt), _})) => excerpt
                  | Some(`UnspecifiedFragment(_))
                  | Some(`MarkdownRemark(_))
                  | None => ""
                  },
                ~date,
                ~url,
                ~guid=url,
                ~custom_elements=
                  switch (parent) {
                  | Some(`MarkdownRemark({html: Some(html), _})) => [|
                      Rss.CustomElement({
                        "content:encoded":
                          html ++ renderLink(~strings, externalLink),
                      }),
                    |]
                  | Some(`UnspecifiedFragment(_))
                  | Some(`MarkdownRemark(_))
                  | None => [||]
                  },
                (),
              );
            | None => failwith("PluginFeed.serialize")
            }
          );
        },
        query: AllPosts.query,
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
        nodes {
          path
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
      | {site: Some({siteMetadata: {siteUrl}}), allSitePage: {nodes}} =>
        Array.map(nodes, ({path}) =>
          Page.make(
            ~url=Webapi.Url.makeWith(path, ~base=siteUrl)->Webapi.Url.href,
            (),
          )
        )
      | _ => failwith("Error building sitemap.")
      },
  };
};
