[@react.component]
let make = () => {
  open Query_BlogData;
  let blogData = useBlogData();
  <section>
    <ul>
      {blogData.allMarkdownRemark.edges
       ->Array.keepMap(blog =>
           switch (blog) {
           | {
               node: {
                 id,
                 excerpt: Some(excerpt),
                 fields: {slug},
                 frontmatter: {
                   title,
                   hero_image:
                     Some({childImageSharp: Some({fluid: Some(fluid)})}),
                   date,
                   _,
                 },
               },
             } =>
             Some(
               <li key=id>
                 <Gatsby.Link _to={"/blog/" ++ slug}>
                   <div>
                     <Gatsby.Img
                       fluid=[|Gatsby.Img.Fluid.make(fluid, "")|]
                       alt=title
                     />
                   </div>
                   <div>
                     <h2> title->React.string </h2>
                     <h3> date->React.string </h3>
                     <p> excerpt->React.string </p>
                   </div>
                 </Gatsby.Link>
               </li>,
             )
           | _ => None
           }
         )
       ->React.array}
    </ul>
  </section>;
};

let default = make;
