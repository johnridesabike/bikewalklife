const fs = require("fs/promises");
const path = require("path");
const { Source } = require("acutis-lang");
const { icons } = require("feather-icons");
const Image = require("@11ty/eleventy-img");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const postcssCustomMedia = require("postcss-custom-media");
const { cloudinary_url } = require("../_data/config.json");
const contactForm = require("../assets/contact-form-server");

const cssVariables = path.resolve(__dirname, "..", "assets", "variables.css");
const cssMedia = path.resolve(__dirname, "..", "assets", "custom-media.css");
const postcssWithOptions = postcss([
  postcssPresetEnv({ importFrom: cssVariables }),
  postcssCustomMedia({ importFrom: cssMedia }),
]);

const postcssCache = new Map();
const faviconCache = new Map();

const manifestFile = fs
  .readFile(path.resolve(__dirname, "..", "_site", "assets", "manifest.json"), {
    encoding: "utf8",
  })
  .then((x) => JSON.parse(x));

module.exports = [
  Source.func("PostCss", (env, _props, { Children }) => {
    if (Children) {
      return env.flatMapChild(Children, (content) => {
        if (postcssCache.has(content)) {
          return postcssCache.get(content);
        } else {
          const result = postcssWithOptions
            .process(content, { from: undefined })
            .then(env.return)
            .catch(env.error);
          postcssCache.set(content, result);
          return result;
        }
      });
    } else {
      return env.error("PostCss requires a stylesheet as children.");
    }
  }),

  Source.func("Icon", (env, props, _children) =>
    env.return(icons[props.name].toSvg({ class: props.class || "" }))
  ),

  Source.func("Log", (env, props, _children) => {
    console.log(props);
    return env.return("");
  }),

  Source.func("Debugger", (env, _props, _children) => {
    debugger;
    return env.return("");
  }),

  Source.func("Webpack", (env, props, _children) =>
    manifestFile.then((data) => {
      const x = data[props.asset];
      if (x) {
        return env.return(x);
      } else {
        return env.error(`${props.asset} doesn't exist in the manifest.`);
      }
    })
  ),

  Source.func("WebpackInline", (env, props, _children) =>
    manifestFile.then((data) => {
      const assetPath = data[props.asset];
      if (assetPath) {
        return fs
          .readFile(path.resolve(__dirname, "..", "_site", "." + assetPath), {
            encoding: "utf8",
          })
          .then((data) => env.return(data));
      } else {
        return env.error(`${props.asset} doesn't exist in the manifest.`);
      }
    })
  ),

  Source.funcWithString(
    "Link",
    `<a
  href="{{ href }}"
  class='{{ class ? "" }} {{ activeClassName ? "" }}'
  {% match current with null %} {* Nothing! *}
  {% with x %} aria-current="{{ x }}" 
  {% /match %}

  {%~ match style with null ~%} {* Nothing! *}
  {%~ with x %} style="{{ x }}"
  {%~ /match ~%}

  {%~ match tabIndex with null ~%} {* Nothing! *}
  {%~ with x %} tabindex="{{ x }}"
  {%~ /match ~%}
>
  {{ Children }}
</a>`,
    (ast) => (env, props, children) => {
      const current = props.current && props.current.url === props.href;
      let activeClassName;
      if (current) {
        if (props.activeClassName === undefined) {
          activeClassName = "active-page";
        } else {
          activeClassName = props.activeClassName;
        }
      } else {
        activeClassName = null;
      }
      return env.render(
        ast,
        {
          href: props.href || null,
          class: props.class || null,
          style: props.style || null,
          tabIndex: props.tabIndex || null,
          activeClassName: activeClassName,
          current: current ? "page" : null,
        },
        children
      );
    }
  ),

  Source.funcWithString(
    "Related",
    `{% match related
  with [] %}
  {* Nothing! *}
{% with related %}
  <h2 class="entry-page__footer-header"> Related posts </h2>
  <ul class="entry-page__related-list">
    {% map related with {data: {title, formattedDate, isoDate}, url} %}
      <li class="entry-page__related-item">
        <div>
          {% Link href=url %}
            {{ title }}
          {% /Link %}
        </div>
        {% Entry_Date date=formattedDate isoDate / %}
      </li>
    {% /map %}
  </ul>
  <hr class="separator" />
{% /match %}`,
    (ast) => (env, props, children) => {
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
        ast,
        {
          related: Array.from(set)
            .sort((a, b) => b.date - a.date)
            .slice(0, props.limit),
        },
        children
      );
    }
  ),

  Source.func("ReactFormHtml", (env, _props, _children) =>
    env.return(contactForm.render())
  ),

  Source.func("ImgSrc", (env, { width, aspect, gravity, image }, _children) => {
    const height = Math.ceil(width * aspect);
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
  }),

  Source.func("ImgSrcStatic", (env, { transforms, image }, _children) => {
    if (!image) {
      return env.error("ImgSrcStatic must have a `image` prop.");
    }
    if (!Array.isArray(transforms)) {
      return env.error("ImgSrcStatic must have a `transforms` array.");
    }
    const opts = transforms.map(encodeURIComponent).join("/");
    return env.return(cloudinary_url + "/" + opts + "/" + image);
  }),

  Source.func("Favicon", (env, { file, width }, _children) => {
    const key = `${file}-${width}`;
    if (faviconCache.has(key)) {
      return faviconCache.get(key);
    } else {
      const result = Image(path.join(__dirname, "..", file), {
        widths: [width],
        formats: ["png"],
        urlPath: "/",
        outputDir: path.join(__dirname, "..", "_site"),
        filenameFormat: (_id, _src, width, format, _options) =>
          `favicon-${width}.${format}`,
      }).then((metadata) => env.return(metadata.png[0].url));
      faviconCache.set(key, result);
      return result;
    }
  }),

  Source.func("PageNumber", (env, { pageNumber }, _children) =>
    env.return(String(pageNumber + 1))
  ),
];
