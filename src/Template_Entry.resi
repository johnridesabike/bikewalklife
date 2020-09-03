module Raw: {
  type t
}

let query: string

module Neighbor: {
  type t = {
    year: int,
    month: int,
    slug: string,
    title: string,
  }
}

type pageContext = {
  slug: string,
  year: int,
  month: int,
  next: option<Neighbor.t>,
  previous: option<Neighbor.t>,
}

@react.component
let default: (~data: Raw.t, ~pageContext: pageContext) => React.element
