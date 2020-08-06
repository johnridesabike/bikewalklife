%raw
"import { graphql } from 'gatsby'";

[%graphql
  {|
  query {
    dataYaml(page: {eq: STRINGS}) {
      contact_text
      contact_form
    }
  }
|}
];

[@react.component]
let default = (~data) => {
  switch (parse(data)) {
  | {dataYaml: Some({contact_text, contact_form})} =>
    <Layout title={String("About")} route=Contact>
      <article>
        <h1> "Contact"->React.string </h1>
        {switch (contact_text) {
         | Some(text) => <p className="ui-font"> text->React.string </p>
         | None => React.null
         }}
        {switch (contact_form) {
         | Some(true) => <Contact_Form />
         | _ => React.null
         }}
      </article>
    </Layout>
  | _ => <Page_404 />
  };
};
