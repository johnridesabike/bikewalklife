const ReactDOMServer = require("react-dom/server");
const React = require("react");
const Contact_Form = require("../lib/js/assets/Contact_Form.bs");

module.exports.render = () =>
  ReactDOMServer.renderToString(
    React.createElement(Contact_Form.make, {}, null)
  );
