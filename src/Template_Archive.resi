let query: Gatsby.query

type pageContext = {skip: int, limit: int}

@react.component
let default: (~data: Js.Json.t) => React.element
