module Url = {
  type t;
  [@bs.new] external make: string => t = "URL";
  /* Safari doesn't let use use optional arguments. */
  [@bs.new] external makeWithBase: (string, ~base: string) => t = "URL";
  [@bs.send] external toString: t => string = "toString";
  [@bs.get] external hostname: t => string = "hostname";
};

[@bs.val] external encodeURIComponent: string => string = "encodeURIComponent";
