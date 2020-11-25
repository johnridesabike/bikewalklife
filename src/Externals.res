module VisuallyHidden = {
  @module("@reach/visually-hidden") @react.component
  external make: (~children: React.element) => React.element = "default"
}

module SkipNav = {
  module Link = {
    @module("@reach/skip-nav") @react.component
    external make: unit => React.element = "SkipNavLink"
  }
  module Content = {
    @module("@reach/skip-nav") @react.component
    external make: unit => React.element = "SkipNavContent"
  }
}

module URLSearchParams = {
  @new
  external makeWithArray: array<(string, string)> => {..} = "URLSearchParams"
}

module Url = {
  @new external make: string => {..} = "URL"
  @new external makeWith: (string, ~base: string) => {..} = "URL"
  @set external setSearch: ({..}, string) => unit = "search"
}

module Rss = {
  /**
   https://www.npmjs.com/package/rss
 */
  @unboxed
  type rec customElement = CustomElement({..}): customElement

  type enclosure

  @obj
  external enclosureUrl: (~url: string, ~size: int=?, ~type_: string=?, unit) => enclosure = ""

  module Feed = {
    type options
    @obj
    external options: (
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
      ~categories: array<string>=?,
      ~pubDate: string=?,
      ~ttl: int=?,
      ~hub: string=?,
      ~custom_namespaces: Js.Dict.t<string>=?,
      ~custom_elements: array<customElement>=?,
      unit,
    ) => options = ""
  }

  module Item = {
    type options
    @obj
    external options: (
      ~title: string,
      ~description: string,
      ~url: string,
      ~guid: string=?,
      ~categories: array<string>=?,
      ~author: string=?,
      ~date: string,
      ~lat: float=?,
      ~long: float=?,
      ~custom_elements: array<customElement>=?,
      ~enclosure: enclosure=?,
      unit,
    ) => options = ""
  }
}
