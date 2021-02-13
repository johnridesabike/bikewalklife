import React from "react";
import ReactDOM from "react-dom";
import * as Webmentions from "../lib/es6/assets/Webmentions.mjs";

// set page_url globally on the page.
ReactDOM.render(
  React.createElement(Webmentions.make, { url: page_url }, null),
  document.getElementById("react-webmentions-root")
);
