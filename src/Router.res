type t =
  | Index
  | About
  | Entry({year: int, month: int, slug: string})
  | Archive(int)
  | Search
  | Contact

let toString = x =>
  switch x {
  | Index => "/"
  | About => "/about/"
  | Entry({year, month, slug}) =>
    "/"
    ++ Int.toString(year)
    ++ "/"
    ++ Int.toString(month)
    ++ "/"
    ++ slug
    ++ "/"
  | Archive(1) => "/archive/"
  | Archive(page) => "/archive/" ++ Int.toString(page) ++ "/"
  | Search => "/search/"
  | Contact => "/contact/"
  }

let toStringWithBase = (route, base) =>
  Externals.Url.makeWith(toString(route), ~base)["href"]

module GatsbyLink = {
  @bs.module("gatsby") @react.component
  external make: (
    ~_to: string,
    ~activeClassName: string=?,
    ~partiallyActive: bool=?,
    ~children: React.element,
    ~tabIndex: int=?,
    ~className: string=?,
    ~style: ReactDOMRe.Style.t=?,
  ) => React.element = "Link"
}

module Link = {
  @react.component
  let make = (
    ~route,
    ~activeClassName="active-page",
    ~partiallyActive=false,
    ~tabIndex=?,
    ~className=?,
    ~style=?,
    ~children,
  ) =>
    <GatsbyLink
      _to={toString(route)}
      activeClassName
      partiallyActive
      ?className
      ?style
      ?tabIndex>
      children
    </GatsbyLink>
}
