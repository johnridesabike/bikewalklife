%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query ContactPage @ppxConfig(inline: true) {
    strings {
      contact_text
    }
  }
  `
)

@react.component
let default = (~data) =>
  switch data->unsafe_fromJson->parse {
  | {strings: Some({contact_text})} =>
    <Layout metadata=Title({title: "Contact", route: Contact})>
      <main>
        <h1> {"Contact"->React.string} </h1>
        {switch contact_text {
        | Some(text) =>
          <div className="ui-font" dangerouslySetInnerHTML={"__html": text} />
        | None => React.null
        }}
        <Contact_Form />
      </main>
    </Layout>
  | _ => <Page_404 />
  }
