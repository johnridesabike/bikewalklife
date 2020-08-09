type t('data);
type graphqlResult('data);

let onCreateNode: t(_) => unit;

module CreatePages: {module Raw: {type t;};};

let createPages:
  t(CreatePages.Raw.t) =>
  Promise.rejectable(graphqlResult(CreatePages.Raw.t), Js.Promise.error);

let createSchemaCustomization: t(_) => unit;

type onCreatePage;
let onCreatePage: onCreatePage => unit;

type createResolvers;
let createResolvers: createResolvers => unit;
