[@bs.module "gatsby"]
external useStaticQueryUnsafe: 'a => 'b = "useStaticQuery";

[@bs.val] external importCss: string => Js.t({..}) = "require";

module Img = {
  module Fluid = {
    type t;
    [@bs.obj]
    external _make:
      (
        ~src: string,
        ~srcSet: string,
        ~sizes: string,
        ~aspectRatio: float,
        ~media: string,
        ~base64: string=?,
        ~srcWebp: string=?,
        ~srcSetWebp: string=?,
        ~tracedSVG: string=?,
        unit
      ) =>
      t;
    [@bs.get] external src: t => string = "src";
    let make =
        (
          Fragments.ImageFluid.{src, srcSet, sizes, aspectRatio, base64},
          media,
        ) =>
      _make(~media, ~src, ~srcSet, ~sizes, ~aspectRatio, ~base64?, ());

    let makeWithSvg =
        (
          Fragments.ImageFluid_tracedSVG.{
            src,
            srcSet,
            sizes,
            aspectRatio,
            tracedSVG,
          },
          media,
        ) =>
      _make(~media, ~src, ~srcSet, ~sizes, ~aspectRatio, ~tracedSVG?, ());

    let makeWithWebpSvg =
        (
          Fragments.ImageFluid_withWebp_tracedSVG.{
            src,
            srcSet,
            sizes,
            aspectRatio,
            tracedSVG,
            srcWebp,
            srcSetWebp,
          },
          media,
        ) =>
      _make(
        ~media,
        ~src,
        ~srcSet,
        ~sizes,
        ~aspectRatio,
        ~tracedSVG?,
        ~srcWebp?,
        ~srcSetWebp?,
        (),
      );
  };
  module Fixed = {
    type t;
    [@bs.obj]
    external make:
      (
        ~src: string,
        ~srcSet: string,
        ~height: float,
        ~width: float,
        ~media: string,
        ~base64: string=?,
        unit
      ) =>
      t;
    let make =
        (Fragments.ImageFixed.{src, srcSet, height, width, base64}, media) =>
      make(~src, ~srcSet, ~height, ~width, ~media, ~base64?, ());
  };
  [@bs.module "gatsby-image"] [@react.component]
  external make:
    (
      ~fluid: array(Fluid.t)=?,
      ~fixed: array(Fixed.t)=?,
      ~alt: string,
      ~className: string=?,
      ~style: ReactDOMRe.Style.t=?
    ) =>
    React.element =
    "default";
};
