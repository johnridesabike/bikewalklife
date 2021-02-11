const { Compile, Environment } = require("acutis-lang");
const { loadTemplate, filenameToComponent } = require("acutis-lang/node-utils");
const path = require("path");
const fastGlob = require("fast-glob");

module.exports = (eleventyConfig, config) => {
  const components = { ...config.components };
  // Remove stale cache.
  eleventyConfig.on("beforeWatch", (files) =>
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        delete require.cache[require.resolve(file)];
      }
    })
  );
  let env = Environment.Async.make(components);
  const cache = new Map();
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
      return fastGlob(filesGlob)
        .then((files) =>
          files.map((fileName) =>
            loadTemplate(fileName)
              .then((file) => {
                if (file) {
                  components[filenameToComponent(fileName)] = file;
                }
              })
              .catch((e) => console.warn(e.message))
          )
        )
        .then((files) => Promise.all(files))
        .then(() => {
          env = Environment.Async.make(components);
          cache.clear();
        });
    },
    compile: (src, inputPath) => (props) => {
      // I hope caching this doesn't break anything! This isn't a performance
      // bottleneck but *seems* like it can't hurt.
      if (!cache.has(src)) {
        cache.set(src, Compile.make(src, inputPath));
      }
      const template = cache.get(src);
      return template(env, props, {}).then(({ NAME, VAL }) => {
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
