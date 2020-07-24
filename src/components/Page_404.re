[@react.component]
let make = () =>
  <Layout page="404">
    <div>
      <Gatsby.Link _to="/">
        <h1> "Sorry, couldn't find that page."->React.string </h1>
      </Gatsby.Link>
    </div>
  </Layout>;
