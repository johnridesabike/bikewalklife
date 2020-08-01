module Url = {
  type t;
  [@bs.new] external make: (~url: string, ~base: string) => t = "URL";
  [@bs.send] external toString: t => string = "toString";
};
