module Url = {
  type t;
  [@bs.new] external make: (string, ~base: string=?, unit) => t = "URL";
  [@bs.send] external toString: t => string = "toString";
  [@bs.get] external hostname: t => string = "hostname";
};
