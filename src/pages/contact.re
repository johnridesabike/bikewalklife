%raw
{|import { graphql } from "gatsby"|};

[%graphql
  {|
  query ContactPage {
    dataYaml(page: {eq: STRINGS}) {
      contact_text
      contact_form
    }
  }
|};
  {inline: true}
];

[@react.component]
let default = (~data) => {
  switch (parse(data)) {
  | {dataYaml: Some({contact_text, contact_form})} =>
    <Layout title={String("About")} route=Contact>
      <article>
        <h1> "Contact"->React.string </h1>
        {switch (contact_text) {
         | Some(text) =>
           <div
             className="ui-font"
             dangerouslySetInnerHTML={"__html": text}
           />
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
