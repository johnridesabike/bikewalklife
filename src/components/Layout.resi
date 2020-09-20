type metadata =
  | Site
  | String(string)

@react.component
let make: (~metadata: Metadata.t, ~children: React.element) => React.element
