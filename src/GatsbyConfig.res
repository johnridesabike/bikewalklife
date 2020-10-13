@module external config: {..} = "../../../config.json"

module PluginFeed = {
  %graphql(
    `
    query Site @ppxConfig(taggedTemplate: false, templateTagReturnType: "string") {
      site {
        siteMetadata {
          title
          description
          siteUrl
          feedUrl
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
          # Turning this off until whatever's wrong with it gets fixed
          #heroImage {
          #  image {
          #    childImageSharp {
          #      resize(
          #        width: 900,
          #        height: 450,
          #        fit: COVER,
          #        cropFocus: ATTENTION
          #       ) {
          #         src
          #      }
          #    }
          #  }
          #}
        }
      }
      strings {
        open_linked
      }
    }
    `
  )


  let renderHtml = (~strings, ~html, href) =>
    switch (href, strings) {
    | (Some(href), Some({FeedPosts.open_linked: Some(text)})) =>
      html
      ++ ReactDOMServer.renderToStaticMarkup(
        <p> <a href> {text->React.string} </a> </p>,
      )
    | _ => html
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
      | Some({siteMetadata: {title, description, siteUrl, feedUrl}}) =>
        Externals.Rss.Feed.options(
          ~title,
          ~description,
          ~site_url=siteUrl,
          ~feed_url=Externals.Url.makeWith(feedUrl, ~base=siteUrl)["href"],
          ~image_url=
            Externals.Url.makeWith("/icons/icon-96x96.png", ~base=siteUrl)["href"],
          ~custom_namespaces=
            Js.Dict.fromArray([
              ("media", "http://search.yahoo.com/mrss/")
            ]),
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
                  author,
                  // heroImage,
                }
              ) => {
                let url = Router.toStringWithBase(
                  Entry({year: year, month: month, slug: slug}),
                  site_url,
                )
                let urlWithCampaign = {
                  let params =
                    Externals.URLSearchParams.makeWithArray([("ref", "feed")])["toString"]()
                  let url = Externals.Url.make(url) // clone the url
                  Externals.Url.setSearch(url, params)
                  url["href"]
                }
                /*
                let heroImageMedia = switch heroImage {
                | Some({
                    image: Some({
                      childImageSharp: Some({resize: Some({src: Some(src)})})
                    })
                  }) => 
                    {
                      "media:content" : {
                        "_attr": {
                          "url": 
                            src
                            ->Externals.Url.makeWith(~base=site_url)
                            ->Externals.Url.href,
                          "medium": "image"
                        }
                      }
                    }
                | _ => Js.Obj.empty()
                }
                */
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
                          renderHtml(~strings, ~html, externalLink),
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
    @obj
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
          Page.make(
            ~url=Externals.Url.makeWith(path, ~base=siteUrl)["href"],
            ()
          )
        )
      | _ => failwith("Error building sitemap.")
      },
  }
}
