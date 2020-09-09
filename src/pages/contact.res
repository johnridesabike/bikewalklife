%%raw(`import { graphql } from "gatsby"`)

%graphql(
  `
  query ContactPage @ppxConfig(inline: true) {
    dataYaml(page: {eq: STRINGS}) {
      contact_text
      contact_form
    }
  }
  `
)

@react.component
let default = (~data) =>
  switch data->unsafe_fromJson->parse {
  | {dataYaml: Some({contact_text, contact_form})} =>
    <Layout title=String("About") route=Contact>
      <main>
        <h1> {"Contact"->React.string} </h1>
        {switch contact_text {
        | Some(text) =>
          <div className="ui-font" dangerouslySetInnerHTML={"__html": text} />
        | None => React.null
        }}
        {switch contact_form {
        | Some(true) => <Contact_Form />
        | _ => React.null
        }}
      </main>
    </Layout>
  | _ => <Page_404 />
  }
