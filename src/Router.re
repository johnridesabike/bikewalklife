type t =
  | Index
  | About
  | Entry(string)
  | Archive(int)
  | Search;

let toString =
  fun
  | Index => "/"
  | About => "/about"
  | Entry(slug) => "/entry/" ++ slug
  | Archive(1) => "/archive"
  | Archive(page) => "/archive/" ++ Int.toString(page)
  | Search => "/search";

module GatsbyLink = {
  [@bs.module "gatsby"] [@react.component]
  external make:
    (
      ~_to: string,
      ~activeClassName: string=?,
      ~partiallyActive: bool=?,
      ~children: React.element,
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
        ~className=?,
        ~style=?,
        ~children,
      ) =>
    <GatsbyLink
      _to={toString(to_)} activeClassName partiallyActive ?className ?style>
      children
    </GatsbyLink>;
};
