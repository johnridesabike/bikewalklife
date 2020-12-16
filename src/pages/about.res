%%raw(`import { graphql } from "gatsby"`)

%graphql(`
  query AboutPage @ppxConfig(inline: true) {
    about: file(sourceInstanceName: {eq: "pages"}, relativePath: {eq: "about.md"}) {
      childMarkdownRemark {
        html
        frontmatter {
          title
          intro
          image: image_large {
            alt
            image {
              relativePath
            }
          }
        }
      }
    }
  }
  `)

@react.component
let default = (~data) =>
  switch data->unsafe_fromJson->parse {
  | {
      about: Some({
        childMarkdownRemark: Some({
          html: Some(html),
          frontmatter: Some({title: Some(title), intro: Some(intro), image}),
        }),
      }),
    } =>
    <Layout metadata=Title({title: title, route: About})>
      <main>
        <h1> {title->React.string} </h1>
        {switch image {
        | Some({image: Some({relativePath, _}), alt}) =>
          <figure className="about__photo-wrapper">
            <div
              className="about__photo"
              style={ReactDOMStyle.make(~height="240px", ~width="240px", ())}>
              <img
                src={"https://res.cloudinary.com/bike-walk-life/image/upload/c_fill,g_center,h_240,w_240/v1608060004/" ++
                relativePath}
                srcSet={`
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_center%2Ch_240%2Cw_240/v1608060004/${relativePath} 1x,
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_center%2Ch_360%2Cw_360/v1608060004/${relativePath} 1x,
                 https://res.cloudinary.com/bike-walk-life/image/upload/c_fill%2Cg_center%2Ch_480%2Cw_480/v1608060004/${relativePath} 2x
                 `}
                ?alt
                height="240"
                width="240"
              />
            </div>
          </figure>
        | _ => React.null
        }}
        <div className="serif about__intro" dangerouslySetInnerHTML={"__html": intro} />
        <div className="serif" dangerouslySetInnerHTML={"__html": html} />
      </main>
      <aside> <Subscribe /> </aside>
    </Layout>
  | _ => <Page_404 />
  }
