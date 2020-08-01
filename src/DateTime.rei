type t = string;
let parse: Js.Json.t => t;

/* This isn't completely safe but also it isn't used for anything. */
let serialize: t => Js.Json.t;
