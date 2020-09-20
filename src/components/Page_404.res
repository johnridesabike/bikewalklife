@react.component
let make = () =>
  <Layout metadata=TitleNoRoute({title: "Not Found"})>
    <div>
      <Router.Link route=Index>
        <h1> {"Sorry, couldn't find that page."->React.string} </h1>
      </Router.Link>
    </div>
  </Layout>
