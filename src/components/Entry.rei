module OriginalLink: {
  [@react.component]
  let make: (~href: string, ~className: string=?) => React.element;
};

module Date: {
  [@react.component]
  let make: (~date: string, ~isoDate: string) => React.element;
};

type image = [
  | `NoImage
  | `Image(array(Gatsby.Img.Fluid.t), string)
  | `ImageNoAlt(array(Gatsby.Img.Fluid.t))
];

[@react.component]
let make:
  (
    ~body: React.element,
    ~url: Router.t,
    ~title: string,
    ~linkedHeader: [ | `Linked | `Unlinked],
    ~hero_image: image,
    ~imageCaption: option(string),
    ~isoDate: string,
    ~date: string,
    ~footer: React.element,
    ~className: string=?
  ) =>
  React.element;
