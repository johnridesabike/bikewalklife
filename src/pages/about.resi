module Raw: {
  type t
}

let query: string

@react.component
let default: (~data: Raw.t) => React.element
