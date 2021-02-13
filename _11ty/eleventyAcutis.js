const { Compile, Environment } = require("acutis-lang");
const { filenameToComponent } = require("acutis-lang/node-utils");
const path = require("path");
const fastGlob = require("fast-glob");
const fs = require("fs/promises");

const cache = new Map();

module.exports = (eleventyConfig, config) => {
  let env = Environment.Async.make({});
  eleventyConfig.addTemplateFormats("acutis");
  eleventyConfig.addExtension("acutis", {
    read: true,
    data: true,
    init: function () {
      const filesGlob = path.join(
        this.config.inputDir,
        this.config.dir.includes,
        "**/*.acutis"
      );
      const components = {};
      return fastGlob(filesGlob)
        .then((files) =>
          Promise.all(
            files.map((fileName) =>
              fs
                .readFile(fileName, "utf-8")
                .then((src) => {
                  if (!cache.has(src)) {
                    cache.set(src, Compile.make(src, fileName));
                  }
                  components[filenameToComponent(fileName)] = cache.get(src);
                })
                .catch((e) => console.error(e.message))
            )
          )
        )
        .then(() => {
          env = Environment.Async.make({ ...components, ...config.components });
        });
    },
    compile: (src, inputPath) => (props) => {
      // I hope caching this doesn't break anything! This isn't a performance
      // bottleneck but *seems* like it can't hurt.
      if (!cache.has(src)) {
        cache.set(src, Compile.make(src, inputPath));
      }
      return cache
        .get(src)(env, props, {})
        .then(({ NAME, VAL }) => {
          if (NAME === "errors") {
            console.error(VAL);
            throw new Error(`Error with ${props.permalink}`);
          } else {
            return VAL;
          }
        });
    },
  });
};
