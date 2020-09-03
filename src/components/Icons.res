module Clock = {
  @bs.module("react-feather") @react.component
  external make:
    (~className: string=?, ~height: int=?, ~width: int=?) => React.element =
    "Clock"
}

module Calendar = {
  @bs.module("react-feather") @react.component
  external make:
    (~className: string=?, ~height: int=?, ~width: int=?) => React.element =
    "Calendar"
}

module ArrowRight = {
  @bs.module("react-feather") @react.component
  external make:
    (~className: string=?, ~height: int=?, ~width: int=?) => React.element =
    "ArrowRight"
}

module ArrowLeft = {
  @bs.module("react-feather") @react.component
  external make:
    (~className: string=?, ~height: int=?, ~width: int=?) => React.element =
    "ArrowLeft"
}

module ExternalLink = {
  @bs.module("react-feather") @react.component
  external make:
    (~className: string=?, ~height: int=?, ~width: int=?) => React.element =
    "ExternalLink"
}

module Rss = {
  @bs.module("react-feather") @react.component
  external make:
    (~className: string=?, ~height: int=?, ~width: int=?) => React.element =
    "Rss"
}
