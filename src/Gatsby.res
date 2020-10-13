type query

module type GraphQLQuery = {
  module Raw: {
    type t
  }
  type t
  let query: query
  external unsafe_fromJson: Js.Json.t => Raw.t = "%identity"
  let parse: Raw.t => t
}

module ExtendQuery = (M: GraphQLQuery) => {
  @module("gatsby")
  external useStaticQuery: query => M.Raw.t = "useStaticQuery"
}

module Img = {
  @module("gatsby-image") @react.component
  external make: (
    ~fluid: 'fluid_unsafe=?,
    ~fixed: 'fixed_unsafe=?,
    ~alt: string,
    ~className: string=?,
    ~style: ReactDOMRe.Style.t=?,
    ~fadeIn: bool=?,
    ~loading: [#\"lazy" | #eager ]=?,
  ) => 
  React.element = "default"
}
