/**
 GraphQL-PPX types Dates as Js.Json.t, but they're just strings.
 */

type t = string;

external parse: Js.Json.t => string = "%identity";

external serialize: string => Js.Json.t = "%identity";
