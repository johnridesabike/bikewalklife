
@react.component
let default = () => {
  let strings = QueryStrings.use()
  <Layout metadata=Title({title: "Contact", route: Contact})>
    <main>
      <h1> {"Contact"->React.string} </h1>
      {switch strings.contact_text {
      | Some(text) =>
        <div className="ui-font" dangerouslySetInnerHTML={"__html": text} />
      | None => React.null
      }}
      <Contact_Form />
    </main>
  </Layout>
}
