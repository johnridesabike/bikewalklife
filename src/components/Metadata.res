module Helmet = {
  @module("react-helmet") @react.component
  external make: (~children: React.element) => React.element = "Helmet"
}

type image = {url: string, alt: option<string>}

type t =
  | Default({route: Router.t})
  | Title({title: string, route: Router.t})
  | TitleNoRoute({title: string})
  | Article({
      title: string,
      description: string,
      author: string,
      date: string,
      route: Router.t,
      image: option<image>,
    })

@react.component
let make = (~children) => {
  let {
    title: siteTitle,
    description: siteDescription,
    siteUrl,
    twitterHandle,
    _,
  } = QuerySiteMetadata.use()
  <>
    <Helmet>
      <html lang="en-US" prefix="og: https://ogp.me/ns# article: https://ogp.me/ns/article#" />
      <meta property="og:site_name" content=siteTitle />
      {switch twitterHandle {
      | Some(content) => <meta name="twitter:site" content />
      | None => React.null
      }}
      <meta name="twitter:card" content="summary" />
      <meta
        property="og:image"
        content={"https://res.cloudinary.com/bike-walk-life/image/upload/logo-large-square.png"}
      />
      <meta name="twitter:image:alt" property="og:image:alt" content={siteTitle ++ " logo"} />
    </Helmet>
    {switch children {
    | Default({route}) =>
      <Helmet>
        <title> {siteTitle->React.string} </title>
        <link rel="canonical" href={Router.toStringWithBase(route, siteUrl)} />
        <meta property="og:url" content={Router.toStringWithBase(route, siteUrl)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content=siteTitle />
        <meta name="description" property="og:description" content=siteDescription />
      </Helmet>
    | Title({title, route}) =>
      <Helmet>
        <title> {`${title} | ${siteTitle}`->React.string} </title>
        <link rel="canonical" href={Router.toStringWithBase(route, siteUrl)} />
        <meta property="og:url" content={Router.toStringWithBase(route, siteUrl)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content=siteTitle />
        <meta name="description" property="og:description" content=siteDescription />
      </Helmet>
    | TitleNoRoute({title}) =>
      <Helmet>
        <title> {`${title} | ${siteTitle}`->React.string} </title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content=siteTitle />
        <meta name="description" property="og:description" content=siteDescription />
      </Helmet>
    | Article({title, description, author, date, route, image}) =>
      <Helmet>
        <title> {`${title} | ${siteTitle}`->React.string} </title>
        <link rel="canonical" href={Router.toStringWithBase(route, siteUrl)} />
        <meta property="og:url" content={Router.toStringWithBase(route, siteUrl)} />
        <meta property="og:title" content=title />
        <meta name="description" property="og:description" content=description />
        <meta name="author" content=author />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content=date />
        {switch image {
        | Some({url, _}) =>
          <meta property="og:image" content={Externals.Url.makeWith(url, ~base=siteUrl)["href"]} />
        | None => React.null
        }}
        {switch image {
        | Some(_) => <meta name="twitter:card" content="summary_large_image" />
        | None => React.null
        }}
        {switch image {
        | Some({alt: Some(alt), _}) =>
          <meta name="twitter:image:alt" property="og:image:alt" content=alt />
        | _ => React.null
        }}
      </Helmet>
    }}
  </>
}
