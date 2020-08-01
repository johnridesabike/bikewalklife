module Raw: {type t;};

let query: string;

type pageContext = {skip: int, limit: int};

[@react.component]
let default: (~data: Raw.t) => React.element;
