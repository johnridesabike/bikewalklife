let query: string;

type metadata =
  | Site
  | String(string);

[@react.component]
let make: (~title: metadata, ~children: React.element) => React.element;
