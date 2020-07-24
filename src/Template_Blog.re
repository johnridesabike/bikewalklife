%raw
"import { graphql } from 'gatsby'";

module ImageFluid = Query_Frag_ImageFluid;
[%graphql
  {|
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      fields {
        slug
      }
      frontmatter {
        title
        author
        date(formatString: "MMMM Do, YYYY") @ppxCustom(module: "DateTime")
        hero_image {
          childImageSharp {
            fluid(maxWidth: 1500) {
              ...ImageFluid
            }
          }
        }
      }
      html
    }
  }
|}
];

let getNextSlug = (allBlogData: Query_BlogData.t, slug) => {
  let allSlugs =
    allBlogData.allMarkdownRemark.edges
    ->Array.map(({node: {fields: {slug}, _}}) => slug);
  let nextSlug = allSlugs[allSlugs->Js.Array2.indexOf(slug) + 1];
  switch (nextSlug) {
  | Some(x) when x !== "" => x
  | _ => allSlugs[0]->Option.getExn
  };
};

[@react.component]
let make = (~data: Raw.t) => {
  switch (parse(data)) {
  | {
      markdownRemark:
        Some({
          html: Some(html),
          fields: {slug},
          frontmatter: {
            hero_image: Some({childImageSharp: Some({fluid: Some(fluid)})}),
            title,
            date,
            author,
          },
        }),
    } =>
    let allBlogData = Query_BlogData.useBlogData();
    let nextSlug = getNextSlug(allBlogData, slug);
    <Layout>
      <article>
        <figure>
          <Gatsby.Img fluid=[|Gatsby.Img.Fluid.make(fluid, "")|] alt=title />
        </figure>
        <div>
          <h1> title->React.string </h1>
          <h3> date->React.string </h3>
        </div>
        <div dangerouslySetInnerHTML={"__html": html} />
        <div>
          <h2> {"Written By: " ++ author |> React.string} </h2>
          <Gatsby.Link _to={"/blog/" ++ nextSlug}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              x="0px"
              y="0px"
              viewBox="0 0 26 26"
              enableBackground="new 0 0 26 26">
              <path
                d="M23.021,12.294l-8.714-8.715l-1.414,1.414l7.007,7.008H2.687v2h17.213l-7.007,7.006l1.414,1.414l8.714-8.713  C23.411,13.317,23.411,12.685,23.021,12.294z"
              />
            </svg>
          </Gatsby.Link>
        </div>
      </article>
    </Layout>;
  | _ => React.null
  };
};

let default = make;
