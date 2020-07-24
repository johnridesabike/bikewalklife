module Link = {
  [@bs.module "gatsby"] [@react.component]
  external make:
    (~_to: string, ~activeClassName: string=?, ~children: React.element) =>
    React.element =
    "Link";
};

[@bs.module "gatsby"]
external useStaticQueryUnsafe: 'a => 'b = "useStaticQuery";

[@bs.val] external importCss: string => Js.t({..}) = "require";

module Img = {
  module Fluid = {
    type t = {
      src: string,
      srcSet: string,
      sizes: string,
      aspectRatio: float,
      media: string,
    };
    let make =
        ({Query_Frag_ImageFluid.src, srcSet, sizes, aspectRatio}, media) => {
      media,
      src,
      srcSet,
      sizes,
      aspectRatio,
    };
  };
  [@bs.module "gatsby-image"] [@react.component]
  external make:
    (
      ~fluid: array(Fluid.t)=?,
      ~alt: string,
      ~className: string=?,
      ~style: ReactDOMRe.Style.t=?
    ) =>
    React.element =
    "default";
};
