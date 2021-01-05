const fs = require("fs/promises");
const path = require("path");
const { Compile, Environment } = require("acutis-lang");
const { loadTemplate, filenameToComponent } = require("acutis-lang/node-utils");
const fastGlob = require("fast-glob");
const { icons } = require("feather-icons");
const Image = require("@11ty/eleventy-img");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const postcssCustomMedia = require("postcss-custom-media");
const { cloudinary_url } = require("./_data/config.json");

module.exports = (eleventyConfig) => {
  const cssVariables = path.resolve(__dirname, "assets", "variables.css");
  const cssMedia = path.resolve(__dirname, "assets", "custom-media.css");
  const postcssWithOptions = postcss([
    postcssPresetEnv({ importFrom: cssVariables }),
    postcssCustomMedia({ importFrom: cssMedia }),
  ]);

  const PostCss = (env, _props, { Children }) => {
    if (Children) {
      return env.flatMapChild(Children, (content) =>
        postcssWithOptions
          .process(content, { from: undefined })
          .then(env.return)
          .catch(env.error)
      );
    } else {
      return env.error("PostCss requires a stylesheet as children.");
    }
  };

  const Icon = (env, props, _children) =>
    env.return(icons[props.name].toSvg({ class: props.class || "" }));

  const Log = (env, props, _children) => {
    console.log(props);
    return env.return("");
  };

  const Debugger = (env, _props, _children) => {
    debugger;
    return env.return("");
  };

  const manifestPath = path.resolve(__dirname, "_site/assets/manifest.json");

  const Webpack = (env, props, _children) =>
    fs.readFile(manifestPath, { encoding: "utf8" }).then((data) => {
      const x = JSON.parse(data)[props.asset];
      if (x) {
        return env.return(x);
      } else {
        return env.error(`${props.asset} doesn't exist in the manifest.`);
      }
    });

  const AbsoluteUrl = (env, props, _children) =>
    env.return(new URL(props.url, props.base).href);

  const linkAst = Compile.makeAst(
    `<a
  href="{{ href }}"
  class="{{ class }} {{ activeClassName}} "
  {% match current with null %} {* Nothing! *}
  {% with x %} aria-current="{{ x }}" 
  {% /match %}

  {%~ match style with null ~%} {* Nothing! *}
  {%~ with x %} style="{{ x }}"
  {%~ /match ~%}

  {%~ match tabindex with null ~%} {* Nothing! *}
  {%~ with x %} tabindex="{{ x }}"
  {%~ /match ~%}
>
  {{ Children }}
</a>`,
    "Link"
  );

  const Link = (env, props, children) => {
    const current = props.current && props.current.url === props.href;
    let activeClassName;
    if (current) {
      if (props.activeClassName === undefined) {
        activeClassName = "active-page";
      } else {
        activeClassName = props.activeClassName;
      }
    } else {
      activeClassName = "";
    }
    return env.render(
      linkAst,
      {
        href: props.href || null,
        class: props.class || "",
        style: props.style || null,
        tabIndex: props.tabIndex || null,
        activeClassName: activeClassName,
        current: current ? "page" : null,
      },
      children
    );
  };

  const relatedAst = Compile.makeAst(
    `
{% match related
  with [] %}
  {* Nothing! *}
{% with related %}
  <h2 class="entry-page__footer-header"> Related posts </h2>
  <ul class="entry-page__related-list">
    {% map related with {data: {title, dateString, isoDate}, url} %}
      <li class="entry-page__related-item">
        <div>
          {% Link href=url %}
            {{ title }}
          {% /Link %}
        </div>
        {% Entry_Date date=dateString isoDate / %}
      </li>
    {% /map %}
  </ul>
  <hr class="separator" />
{% /match %}
`,
    "Related"
  );

  const Related = (env, props, children) => {
    const set = new Set();
    for (tag of props.tags) {
      for (item of props.collections[tag]) {
        if (
          !set.has(item) &&
          item.data.permalink !== props.self &&
          item.data.visible
        ) {
          set.add(item);
        }
      }
    }
    return env.render(
      relatedAst,
      {
        related: Array.from(set)
          .sort((a, b) => b.date - a.date)
          .slice(0, props.limit),
      },
      children
    );
  };

  const contactForm = require("./assets/contact-form-server");

  const ReactFormHtml = (env, _props, _children) =>
    env.return(contactForm.render());

  const ImgSrc = (env, { height, width, gravity, image }, _children) => {
    const opts =
      "/" +
      encodeURIComponent(
        "f_auto," +
          "q_auto," +
          "c_fill," +
          `g_${gravity},` +
          `h_${height},` +
          `w_${width}`
      );
    return env.return(cloudinary_url + opts + image);
  };

  const Favicon = (env, props, _children) =>
    Image(path.join(__dirname, props.file), {
      widths: [props.width],
      formats: ["png"],
      urlPath: "/",
      outputDir: path.join(__dirname, "_site"),
      filenameFormat: (_id, _src, width, format, _options) =>
        `favicon-${width}.${format}`,
    }).then((metadata) => env.return(metadata.png[0].url));

  const templates = {
    Icon,
    Log,
    Webpack,
    Link,
    Related,
    ReactFormHtml,
    ImgSrc,
    AbsoluteUrl,
    Favicon,
    PostCss,
    Debugger,
  };
  // Remove stale cache.
  eleventyConfig.on("beforeWatch", (files) =>
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        delete require.cache[require.resolve(file)];
      }
    })
  );
  let env = Environment.Async.make(templates);
  const cache = new Map();
  eleventyConfig.addTemplateFormats("acutis");
  eleventyConfig.addExtension("acutis", {
    read: true,
    data: true,
    init: () =>
      fastGlob("./_includes/**/*.acutis")
        .then((files) =>
          files.map((fileName) =>
            loadTemplate(fileName)
              .then((file) => {
                if (file) {
                  templates[filenameToComponent(fileName)] = file;
                }
              })
              .catch((e) => console.warn(e.message))
          )
        )
        .then((files) => Promise.all(files))
        .then(() => {
          env = Environment.Async.make(templates);
          cache.clear();
        }),
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
