type t('data);
type graphqlResult('data);

module CreatePages: {module Raw: {type t;};};

let createPages:
  t(CreatePages.Raw.t) =>
  Promise.rejectable(graphqlResult(CreatePages.Raw.t), Js.Promise.error);

type onCreatePage;
let onCreatePage: onCreatePage => unit;
