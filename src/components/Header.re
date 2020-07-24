[@react.component]
let make = (~page=?, ~title) =>
  <header>
    <nav role="navigation" ariaLabel="main navigation">
      <Gatsby.Link
        _to={
          switch (page) {
          | Some("info") => "/"
          | _ => "/info"
          }
        }>
        <h1> title->React.string </h1>
      </Gatsby.Link>
      <div>
        <h1>
          <Gatsby.Link _to="/info">
            {switch (page) {
             | Some("info") => "close"->React.string
             | _ => "info"->React.string
             }}
          </Gatsby.Link>
        </h1>
      </div>
    </nav>
  </header>;

let default = make;
