@bs.module("gatsby")
external useStaticQueryUnsafe: 'a => 'b = "useStaticQuery"

module Img: {
  module Fluid: {
    type t

    let make: (QueryFragments.ImageFluid.t) => t

    let makeWithWebpSvg: (QueryFragments.ImageFluid_withWebp_tracedSVG.t) => t
  }

  module Fixed: {
    type t;

    let make: (QueryFragments.ImageFixed.t) => t
  }

  @bs.module("gatsby-image") @react.component
  external make: (
    ~fluid: Fluid.t=?,
    ~fixed: Fixed.t=?,
    ~alt: string,
    ~className: string=?,
    ~style: ReactDOMRe.Style.t=?,
    ~fadeIn: bool=?,
    ~loading: [#\"lazy" | #eager ]=?,
  ) => 
  React.element = "default" 
}
