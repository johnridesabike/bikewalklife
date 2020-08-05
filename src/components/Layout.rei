let query: string;

type metadata =
  | Site
  | String(string);

[@react.component]
let make:
  (~title: metadata, ~route: Router.t=?, ~children: React.element) =>
  React.element;
