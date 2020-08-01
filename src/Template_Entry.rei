module Raw: {type t;};

let query: string;

module Neighbor: {
  type t = {
    slug: string,
    title: string,
  };
};

type pageContext = {
  slug: string,
  next: option(Neighbor.t),
  previous: option(Neighbor.t),
};

[@react.component]
let default: (~data: Raw.t, ~pageContext: pageContext) => React.element;
