let query: Gatsby.query

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
let default: (~data: Js.Json.t, ~pageContext: pageContext) => React.element
