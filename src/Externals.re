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
