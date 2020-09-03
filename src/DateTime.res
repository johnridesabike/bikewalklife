/**
 GraphQL-PPX types Dates as Js.Json.t, but they're just strings.
 */

type t = string

external parse: Js.Json.t => t = "%identity"

external serialize: t => Js.Json.t = "%identity"
