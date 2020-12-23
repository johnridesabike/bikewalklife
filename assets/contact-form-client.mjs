import React from "react";
import ReactDOM from "react-dom";
import * as Contact_Form from "../lib/es6/assets/Contact_Form.bs.js";

ReactDOM.hydrate(
  React.createElement(Contact_Form.make, {}, null),
  document.getElementById("react-form-root")
);
