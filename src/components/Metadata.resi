type image = {url: string, alt: option<string>}

type t =
  | Default({route: Router.t})
  | Title({title: string, route: Router.t})
  | TitleNoRoute({title: string})
  | Article({
      title: string,
      description: string,
      author: string,
      date: string,
      route: Router.t,
      image: option<image>,
    })

@react.component
let make: (~children: t) => React.element
