@bs.module("gatsby")
external useStaticQueryUnsafe: 'a => 'b = "useStaticQuery"

module Img = {
  module Fluid = {
    type t = 
      | Fluid({
          src: string,
          srcSet: string,
          sizes: string,
          aspectRatio: float,
          base64: option<string>,
        })
      | WebpSvg({
          src: string,
          srcSet: string,
          sizes: string,
          aspectRatio: float,
          srcWebp: option<string>,
          srcSetWebp: option<string>,
          tracedSVG: option<string>,
        })


    let make = (
      {QueryFragments.ImageFluid.src, srcSet, sizes, aspectRatio, base64},
    ) => Fluid({src, srcSet, sizes, aspectRatio, base64})

    let makeWithWebpSvg = (
      {
        QueryFragments.ImageFluid_withWebp_tracedSVG.src,
        srcSet,
        sizes,
        aspectRatio,
        tracedSVG,
        srcWebp,
        srcSetWebp,
      },
    ) =>
      WebpSvg({
        src,
        srcSet,
        sizes,
        aspectRatio,
        tracedSVG,
        srcWebp,
        srcSetWebp,
      })
  }
  module Fixed = {
    type t =
      | Fixed({
          src: string,
          srcSet: string,
          height: float,
          width: float,
          base64: option<string>,
        })

    let make = (
      {
        QueryFragments.ImageFixed.src,
        srcSet,
        height,
        width,
        base64
      },
    ) =>
      Fixed({src, srcSet, height, width, base64})
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
