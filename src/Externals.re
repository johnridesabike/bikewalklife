module VisuallyHidden = {
  [@bs.module "@reach/visually-hidden"] [@react.component]
  external make: (~children: React.element) => React.element = "default";
};

module SkipNav = {
  module Link = {
    [@bs.module "@reach/skip-nav"] [@react.component]
    external make: unit => React.element = "SkipNavLink";
  };
  module Content = {
    [@bs.module "@reach/skip-nav"] [@react.component]
    external make: unit => React.element = "SkipNavContent";
  };
};

module Rss = {
  /** https://www.npmjs.com/package/rss */
  [@unboxed]
  type customElement =
    | CustomElement(Js.t({..})): customElement;

  type enclosure;
  /*
   [@bs.obj]
   external enclosureUrl:
     (~url: string, ~size: int=?, ~type_: string=?, unit) => enclosure;
     */

  module Feed = {
    type options;
    [@bs.obj]
    external options:
      (
        ~title: string,
        ~description: string=?,
        ~generator: string=?,
        ~feed_url: string,
        ~site_url: string,
        ~image_url: string=?,
        ~docs: string=?,
        ~managingEditor: string=?,
        ~webMaster: string=?,
        ~copyright: string=?,
        ~language: string=?,
        ~categories: array(string)=?,
        ~pubDate: string=?,
        ~ttl: int=?,
        ~hub: string=?,
        ~custom_namespaces: Js.Dict.t(string)=?,
        ~custom_elements: array(customElement)=?,
        unit
      ) =>
      options;
  };

  module Item = {
    type options;
    [@bs.obj]
    external options:
      (
        ~title: string,
        ~description: string,
        ~url: string,
        ~guid: string,
        ~categories: array(string)=?,
        ~author: string=?,
        ~date: string,
        ~lat: float=?,
        ~long: float=?,
        ~custom_elements: array(customElement)=?,
        ~enclosure: enclosure=?,
        unit
      ) =>
      options;
  };
};

