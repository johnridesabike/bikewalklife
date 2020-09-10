type t
type graphqlResult

let createPages: t => Promise.rejectable<graphqlResult, Js.Promise.error>

type onCreatePage
let onCreatePage: onCreatePage => unit
