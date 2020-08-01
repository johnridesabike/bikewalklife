[@react.component]
let make = () =>
  <Layout title={String("Not Found")}>
    <div>
      <Router.Link to_=Index>
        <h1> "Sorry, couldn't find that page."->React.string </h1>
      </Router.Link>
    </div>
  </Layout>;
