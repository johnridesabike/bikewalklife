const fs = require("fs/promises");
const path = require("path");
const { compile, renderContextAsync, makeAst } = require("acutis-lang");
const { loadTemplate, filenameToComponent } = require("acutis-lang/node-utils");
const fastGlob = require("fast-glob");
const { icons } = require("feather-icons");
const { cloudinary_url } = require("./_data/config.json");

const Icon = (render, props, children) =>
  render(
    makeAst("{% raw x %}", "Icon"),
    { x: icons[props.name].toSvg({ class: props.class || "" }) },
    children
  );

const SitemapDateFormat = (render, { date }, children) =>
  render(
    makeAst("{{ x }}", "SitemapDateFormat"),
    { x: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` },
    children
  );

const Log = (render, props, children) => {
  console.log(props);
  return render(makeAst("", "Log"), props, children);
};

const manifestPath = path.resolve(__dirname, "_site/assets/manifest.json");

const Webpack = (render, props, children) =>
  fs.readFile(manifestPath, { encoding: "utf8" }).then((data) => {
    const x = JSON.parse(data)[props.asset];
    if (x) {
      return render(makeAst(`{{ x }}`, "Webpack"), { x: x }, children);
    } else {
      throw new Error(`${props.name} doesn't exist in the manifest.`);
    }
  });

const AbsoluteUrl = (render, { url, base }, children) =>
  render(
    makeAst("{{ x }}", "AbsoluteUrl"),
    { x: new URL(url, base).href },
    children
  );

const linkAst = makeAst(
  `<a
  href={{ href }}
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

const Link = (render, props, children) => {
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
  return render(
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

const relatedAst = makeAst(
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

const Related = (render, props, children) => {
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
  return render(
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

const ReactFormHtml = (render, _props, children) =>
  render(
    makeAst("{% raw x %}", "ReactFormHtml"),
    { x: contactForm.render() },
    children
  );

const imgSrcAst = makeAst("{{ cloudinary_url }}{{ opts }}{{image }}", "ImgSrc");

const ImgSrc = (render, { height, width, image, gravity }, children) => {
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
  return render(imgSrcAst, { opts, image, cloudinary_url }, children);
};

module.exports = (eleventyConfig) => {
  const templates = {
    Icon,
    SitemapDateFormat,
    Log,
    Webpack,
    Link,
    Related,
    ReactFormHtml,
    ImgSrc,
    AbsoluteUrl,
  };
  // Remove stale cache.
  eleventyConfig.on("beforeWatch", (files) =>
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        delete require.cache[require.resolve(file)];
      }
    })
  );
  let render = renderContextAsync(templates);
  eleventyConfig.addTemplateFormats("acutis");
  eleventyConfig.addExtension("acutis", {
    read: true,
    data: true,
    init: () =>
      fastGlob("./_includes/**/*.acutis").then((files) =>
        Promise.all(
          files.map((fileName) =>
            loadTemplate(fileName)
              .then((file) => {
                if (file) {
                  templates[filenameToComponent(fileName)] = file;
                }
              })
              .catch((e) => console.warn(e.message))
          )
        ).then(() => {
          render = renderContextAsync(templates);
        })
      ),
    compile: (src, inputPath) => (props) => {
      const template = compile(src, inputPath);
      return template(render, props, {}).then(({ NAME, VAL }) => {
        if (NAME === "errors") {
          console.table(VAL);
          throw new Error(`Error with ${props.permalink}`);
        } else {
          return VAL;
        }
      });
    },
  });
};
