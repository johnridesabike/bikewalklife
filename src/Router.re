type t =
  | Index
  | About
  | Entry({
      year: int,
      month: int,
      slug: string,
    })
  | Archive(int)
  | Search;

let toString =
  fun
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
  | Search => "/search/";

let toStringWithBase = (route, base) =>
  Webapi.Url.makeWithBase(toString(route), base)->Webapi.Url.href;

module GatsbyLink = {
  [@bs.module "gatsby"] [@react.component]
  external make:
    (
      ~_to: string,
      ~activeClassName: string=?,
      ~partiallyActive: bool=?,
      ~children: React.element,
      ~tabIndex: int=?,
      ~className: string=?,
      ~style: ReactDOMRe.Style.t=?
    ) =>
    React.element =
    "Link";
};

module Link = {
  [@react.component]
  let make =
      (
        ~to_,
        ~activeClassName="active-page",
        ~partiallyActive=false,
        ~tabIndex=?,
        ~className=?,
        ~style=?,
        ~children,
      ) =>
    <GatsbyLink
      _to={toString(to_)}
      activeClassName
      partiallyActive
      ?className
      ?style
      ?tabIndex>
      children
    </GatsbyLink>;
};
