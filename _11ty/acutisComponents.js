const fs = require("fs/promises");
const path = require("path");
const { Source, Typescheme } = require("acutis-lang");
const { icons } = require("feather-icons");
const Image = require("@11ty/eleventy-img");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const { cloudinary_url } = require("../_data/config.json");
const contactForm = require("../assets/contact-form-server");

const postcssWithOptions = postcss([
  postcssPresetEnv({
    importFrom: path.resolve(__dirname, "..", "assets", "style.css"),
  }),
]);

const postcssCache = new Map();
const faviconCache = new Map();

const manifestFile = fs
  .readFile(path.resolve(__dirname, "..", "_site", "assets", "manifest.json"), {
    encoding: "utf8",
  })
  .then((x) => JSON.parse(x));

const Ty = Typescheme;

module.exports = [
  Source.fn(
    "PostCss",
    Ty.make([]),
    Ty.Child.make([Ty.Child.child("Children")]),
    (Env, _props, { Children }) =>
      Env.flatmap(Children, (content) => {
        if (postcssCache.has(content)) {
          return postcssCache.get(content);
        } else {
          const result = postcssWithOptions
            .process(content, { from: undefined })
            .then(Env.return_)
            .catch(Env.error);
          postcssCache.set(content, result);
          return result;
        }
      })
  ),

  Source.fn(
    "Icon",
    Ty.make([
      ["name", Ty.string()],
      ["class", Ty.nullable(Ty.string())],
    ]),
    Ty.Child.make([]),
    (Env, props, _children) =>
      Env.return_(icons[props.name].toSvg({ class: props.class || "" }))
  ),

  Source.fn(
    "Log",
    Ty.make([["val", Ty.unknown()]]),
    Ty.Child.make([]),
    (Env, props, _children) => {
      console.log(props.val);
      return Env.return_("");
    }
  ),

  Source.fn(
    "Debugger",
    Ty.make([["val", Ty.unknown()]]),
    Ty.Child.make([]),
    (Env, _props, _children) => {
      debugger;
      return Env.return_("");
    }
  ),

  Source.fn(
    "Webpack",
    Ty.make([["asset", Ty.string()]]),
    Ty.Child.make([]),
    (Env, props, _children) =>
      manifestFile.then((data) => {
        const x = data[props.asset];
        if (x) {
          return Env.return_(x);
        } else {
          return Env.error(`${props.asset} doesn't exist in the manifest.`);
        }
      })
  ),

  Source.fn(
    "WebpackInline",
    Ty.make([["asset", Ty.string()]]),
    Ty.Child.make([]),
    (Env, props, _children) =>
      manifestFile.then((data) => {
        const assetPath = data[props.asset];
        if (assetPath) {
          return fs
            .readFile(path.resolve(__dirname, "..", "_site", "." + assetPath), {
              encoding: "utf8",
            })
            .then((data) => Env.return_(data));
        } else {
          return Env.error(`${props.asset} doesn't exist in the manifest.`);
        }
      })
  ),

  Source.fn(
    "Link",
    Ty.make([
      ["current", Ty.nullable(Ty.string())],
      ["href", Ty.string()],
      ["activeClassName", Ty.nullable(Ty.string())],
      ["class", Ty.nullable(Ty.string())],
      ["style", Ty.nullable(Ty.string())],
      ["tabIndex", Ty.nullable(Ty.int_())],
    ]),
    Ty.Child.make([Ty.Child.child("Children")]),
    (Env, props, { Children }) => {
      const current =
        props.current && props.current === props.href ? "page" : null;
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
      return Env.map(
        Children,
        (Children) => `<a
          href="${props.href}"
          class='${props.class || ""} ${activeClassName || ""}'
          ${current ? `aria-current="${current}"` : ""}
          ${props.style ? `style="${props.style}"` : ""}
          ${props.tabIndex ? `tabindex="${props.tabIndex}"` : ""}>
          ${Children}
        </a>`
      );
    }
  ),

  Source.fn(
    "ReactFormHtml",
    Ty.make([]),
    Ty.Child.make([]),
    (Env, _props, _children) => Env.return_(contactForm.render())
  ),

  Source.fn(
    "ImgSrc",
    Ty.make([
      ["width", Ty.int_()],
      ["aspect", Ty.float_()],
      ["gravity", Ty.string()],
      ["image", Ty.string()],
    ]),
    Ty.Child.make([]),
    (Env, { width, aspect, gravity, image }, _children) => {
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
      return Env.return_(cloudinary_url + opts + image);
    }
  ),

  Source.fn(
    "ImgSrcStatic",
    Ty.make([
      ["transforms", Ty.list(Ty.string())],
      ["image", Ty.string()],
    ]),
    Ty.Child.make([]),
    (Env, { transforms, image }, _children) => {
      const opts = transforms.map(encodeURIComponent).join("/");
      return Env.return_(cloudinary_url + "/" + opts + "/" + image);
    }
  ),

  Source.fn(
    "Favicon",
    Ty.make([
      ["file", Ty.string()],
      ["width", Ty.int_()],
    ]),
    Ty.Child.make([]),
    (Env, { file, width }, _children) => {
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
        }).then((metadata) => Env.return_(metadata.png[0].url));
        faviconCache.set(key, result);
        return result;
      }
    }
  ),

  Source.fn(
    "PageNumber",
    Ty.make([["pageNumber", Ty.int_()]]),
    Ty.Child.make([]),
    (Env, { pageNumber }, _children) => Env.return_(String(pageNumber + 1))
  ),
];
