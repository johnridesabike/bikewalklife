@bs.module external config: {..} = "../../../config.json"

module PluginFeed = {
  %graphql(
    `
    query Site @ppxConfig(taggedTemplate: false, templateTagReturnType: "string") {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
    }
    `
  )

  %graphql(
    `
    query FeedPosts @ppxConfig(taggedTemplate: false, templateTagReturnType: "string") {
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
          author
          parent {
            ... on MarkdownRemark {
              __typename
              excerpt(pruneLength: 280)
              html
            }
          }
        }
      }
      strings: dataYaml(page: {eq: STRINGS}) {
        open_linked
      }
    }
    `
  )


  let renderLink = (~strings, href) =>
    switch (href, strings) {
    | (Some(href), Some({FeedPosts.open_linked: Some(text)})) =>
      ReactDOMServer.renderToStaticMarkup(
        <p>
          <a href>
            {text->React.string}
            {" "->React.string}
            <span ariaHidden=true>
              <Icons.ExternalLink height=16 width=16 />
            </span>
          </a>
        </p>,
      )
    | _ => ""
    }

  type query<'a> = {query: 'a}

  module Serialize = {
    module Raw = {
      /* This is the two queries merged together */
      type t
    }
    let unsafeParse = query =>
      (query->Obj.magic->Site.parse, query->Obj.magic->FeedPosts.parse)
  }

  module Feed = {
    type t = {
      query: string,
      serialize: query<Serialize.Raw.t> => array<Externals.Rss.Item.options>,
      output: string,
      title: string,
    }
  }
  type t = {
    query: string,
    setup: query<Site.Raw.t> => Externals.Rss.Feed.options,
    feeds: array<Feed.t>,
  }

  let options = {
    query: Site.query,
    setup: ({query}) =>
      switch Site.parse(query).site {
      | Some({siteMetadata: {title, description, siteUrl}}) =>
        Externals.Rss.Feed.options(
          ~title,
          ~description,
          ~site_url=siteUrl,
          ~feed_url=
            Webapi.Url.makeWith(config["feed_url"], ~base=siteUrl)
            ->Webapi.Url.href,
          ~image_url=
            Webapi.Url.makeWith("/icons/icon-96x96.png", ~base=siteUrl)
            ->Webapi.Url.href,
          (),
        )
      | None => failwith("PluginFeed.setup")
      },
    feeds: [
      {
        serialize: ({query}) => {
          let ({Site.site: site}, {FeedPosts.allPost: {nodes}, strings}) =
            Serialize.unsafeParse(query)
          switch site {
          | Some({siteMetadata: {siteUrl: site_url, _}}) =>
            Array.map(
              nodes,
              (
                {
                  slug,
                  year,
                  month,
                  title,
                  date,
                  externalLink,
                  parent,
                  author
                }
              ) => {
                let url = Router.toStringWithBase(
                  Entry({year: year, month: month, slug: slug}),
                  site_url,
                )
                let urlWithCampaign = {
                  let params =
                    [("ref", "feed")]
                    ->Webapi.Url.URLSearchParams.makeWithArray
                    ->Webapi.Url.URLSearchParams.toString
                  let url = Webapi.Url.make(url) // clone the url
                  Webapi.Url.setSearch(url, params)
                  Webapi.Url.href(url)
                }
                Externals.Rss.Item.options(
                  ~title,
                  ~description=switch parent {
                  | Some(#MarkdownRemark({excerpt: Some(excerpt), _})) =>
                    excerpt
                  | Some(#UnspecifiedFragment(_))
                  | Some(#MarkdownRemark(_))
                  | None => ""
                  },
                  ~date,
                  ~url=urlWithCampaign,
                  ~guid=url,
                  ~custom_elements=switch parent {
                  | Some(#MarkdownRemark({html: Some(html), _})) => [
                      Externals.Rss.CustomElement({
                        "content:encoded":
                          html ++ renderLink(~strings, externalLink),
                      }),
                      Externals.Rss.CustomElement({"dc:creator": author}),
                    ]
                  | Some(#UnspecifiedFragment(_))
                  | Some(#MarkdownRemark(_))
                  | None => []
                  },
                  (),
                )
              }
            )
          | None => failwith("PluginFeed.serialize")
          }
        },
        query: FeedPosts.query,
        output: config["feed_url"],
        title: config["title"],
      },
    ],
  }
}

module PluginSiteMap = {
  %graphql(
    `
    query SiteMap @ppxConfig(taggedTemplate: false, templateTagReturnType: "string") {
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
    `
  )

  module Page = {
    type t
    @bs.obj
    external make:
      (~url: string, ~changefreq: string=?, ~priority: float=?, unit) => t = ""
  }

  type t = {
    output: string,
    exclude: array<string>,
    query: string,
    resolveSiteUrl: SiteMap.Raw.t => string,
    serialize: SiteMap.Raw.t => array<Page.t>,
  }

  let options = {
    output: "/sitemap.xml",
    exclude: [],
    query: SiteMap.query,
    resolveSiteUrl: query =>
      switch SiteMap.parse(query) {
      | {site: Some({siteMetadata: {siteUrl}}), _} => siteUrl
      | _ => failwith("Error building sitemap.")
      },
    serialize: query =>
      switch SiteMap.parse(query) {
      | {site: Some({siteMetadata: {siteUrl}}), allSitePage: {nodes}} =>
        Array.map(nodes, ({path}) =>
          Page.make(~url=Webapi.Url.makeWith(path, ~base=siteUrl)->Webapi.Url.href, ())
        )
      | _ => failwith("Error building sitemap.")
      },
  }
}
