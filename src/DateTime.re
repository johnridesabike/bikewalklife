type t = string;

let parse = x =>
  switch (Js.Json.decodeString(x)) {
  | None => failwith("DateTime.parse")
  | Some(x) => x
  };

let serialize = Js.Json.string;
