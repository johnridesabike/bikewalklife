const path = require("path");
const fs = require("fs");
const util = require("util");
const fastGlob = require("fast-glob");
const { Compile, Render, Result, Source, Typescheme } = require("acutis-lang");
const { filenameToComponent } = require("acutis-lang/node-utils");

const readFile = util.promisify(fs.readFile);

function onComponentsError(e) {
  console.error(e);
  throw new Error(
    "I couldn't compile Acutis components due to the previous errors."
  );
}

module.exports = function (eleventyConfig, config) {
  let components = Compile.Components.empty();
  eleventyConfig.addTemplateFormats("acutis");
  eleventyConfig.addExtension("acutis", {
    read: true,
    data: true,
    init: function () {
      const glob = path.join(
        this.config.inputDir,
        this.config.dir.includes,
        "**/*.acutis"
      );
      return fastGlob(glob)
        .then((files) =>
          Promise.all(
            files.map((fileName) =>
              readFile(fileName, "utf-8").then((str) =>
                Source.src(filenameToComponent(fileName), str)
              )
            )
          )
        )
        .then((queue) => {
          const componentsResult = Compile.Components.make([
            ...queue,
            ...config.components,
          ]);
          components = Result.getOrElse(componentsResult, onComponentsError);
        });
    },
    compile: function (str, inputPath) {
      function onError(e) {
        console.error(e);
        throw new Error(
          `I couldn't render ${inputPath} due to the previous errors.`
        );
      }
      const template = Result.getOrElse(
        Compile.make(inputPath, str, components),
        onError
      );
      return function (data) {
        return Render.async(template, data).then((result) =>
          Result.getOrElse(result, onError)
        );
      };
    },
  });
};
