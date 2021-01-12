import React from "react";
import ReactDOM from "react-dom";
import * as Webmentions from "../lib/es6/assets/Webmentions.bs.js";

ReactDOM.render(
  React.createElement(Webmentions.make, { url: page_url }, null),
  document.getElementById("react-webmentions-root")
);
