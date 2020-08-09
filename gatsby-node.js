const config = require("./lib/js/src/GatsbyNode.bs.js");
module.exports.onCreateNode = config.onCreateNode;
module.exports.createPages = config.createPages;
module.exports.createSchemaCustomization = config.createSchemaCustomization;
module.exports.onCreatePage = config.onCreatePage;
module.exports.createResolvers = config.createResolvers;
