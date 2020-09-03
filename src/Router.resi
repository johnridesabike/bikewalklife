type t =
  | Index
  | About
  | Entry({year: int, month: int, slug: string})
  | Archive(int)
  | Search
  | Contact

let toString: t => string

let toStringWithBase: (t, string) => string

module Link: {
  @react.component
  let make: (
    ~route: t,
    ~activeClassName: string=?,
    ~partiallyActive: bool=?,
    ~tabIndex: int=?,
    ~className: string=?,
    ~style: ReactDOMRe.Style.t=?,
    ~children: React.element,
  ) => React.element
}
