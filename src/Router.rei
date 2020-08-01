type t =
  | Index
  | About
  | Entry(string)
  | Archive(int)
  | Search;

let toString: t => string;

module Link: {
  [@react.component]
  let make:
    (
      ~to_: t,
      ~activeClassName: string=?,
      ~partiallyActive: bool=?,
      ~className: string=?,
      ~style: ReactDOMRe.Style.t=?,
      ~children: React.element
    ) =>
    React.element;
};
