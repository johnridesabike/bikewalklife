let query: string

type pageContext = {skip: int, limit: int}

@react.component
let default: (~data: Js.Json.t) => React.element
