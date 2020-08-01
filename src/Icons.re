module Clock = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "Clock";
};

module Calendar = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "Calendar";
}

module ArrowRight = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "ArrowRight";
};

module ArrowLeft = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "ArrowLeft";
};

module ExternalLink = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "ExternalLink";
};
