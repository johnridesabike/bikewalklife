module OriginalLink: {
  @react.component
  let make: (~href: string, ~className: string=?) => React.element
}

module Date: {
  @react.component
  let make: (~date: string, ~isoDate: string) => React.element
}

module Image: {
  type position =
    | AboveFold
    | BelowFold

  type t

  let empty: t

  let make: (~alt: string=?, array<Gatsby.Img.Fluid.t>, position) => t
}

type linked =
  | Linked
  | Unlinked

@react.component
let make: (
  ~body: React.element,
  ~url: Router.t,
  ~title: string,
  ~linkedHeader: linked,
  ~heroImage: Image.t,
  ~imageCaption: option<string>,
  ~isoDate: string,
  ~date: string,
  ~draft: bool,
  ~footer: React.element,
  ~className: string=?,
) => React.element
