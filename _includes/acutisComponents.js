const path = require("path");
const { Component, Typescheme, TypeschemeChildren } = require("acutis-lang");
const { icons } = require("feather-icons");
const Image = require("@11ty/eleventy-img");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const { cloudinary_url } = require("../_data/config.json");

const postcssWithOptions = postcss([
  postcssPresetEnv({
    importFrom: path.resolve(__dirname, "..", "assets", "style.css"),
  }),
]);

const postcssCache = new Map();
const faviconCache = new Map();

const Ty = Typescheme;
const TyChild = TypeschemeChildren;

module.exports = [
  Component.funAsync(
    "PostCss",
    Ty.make([]),
    TyChild.make([TyChild.child("Children")]),
    (_props, { Children }) =>
      Children.then((content) => {
        if (postcssCache.has(content)) {
          return postcssCache.get(content);
        } else {
          const result = postcssWithOptions
            .process(content, {
              from: undefined,
            })
            .then((result) => result.css);
          postcssCache.set(content, result);
          return result;
        }
      })
  ),

  Component.funAsync(
    "Icon",
    Ty.make([
      ["name", Ty.string()],
      ["class", Ty.nullable(Ty.string())],
    ]),
    TyChild.make([]),
    (props, _children) =>
      Promise.resolve(icons[props.name].toSvg({ class: props.class || "" }))
  ),

  Component.funAsync(
    "Log",
    Ty.make([["val", Ty.unknown()]]),
    TyChild.make([]),
    (props, _children) => {
      console.log(props.val);
      return Promise.resolve("");
    }
  ),

  Component.funAsync(
    "Link",
    Ty.make([
      ["current", Ty.nullable(Ty.string())],
      ["href", Ty.string()],
      ["activeClassName", Ty.nullable(Ty.string())],
      ["class", Ty.nullable(Ty.string())],
      ["style", Ty.nullable(Ty.string())],
      ["tabIndex", Ty.nullable(Ty.int())],
    ]),
    TyChild.make([TyChild.child("Children")]),
    (props, { Children }) => {
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
      return Children.then(
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

  Component.funAsync(
    "ImgSrc",
    Ty.make([
      ["width", Ty.int()],
      ["aspect", Ty.float()],
      ["gravity", Ty.string()],
      ["image", Ty.string()],
    ]),
    TyChild.make([]),
    ({ width, aspect, gravity, image }, _children) => {
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
      return Promise.resolve(cloudinary_url + opts + image);
    }
  ),

  Component.funAsync(
    "ImgSrcStatic",
    Ty.make([
      ["transforms", Ty.list(Ty.string())],
      ["image", Ty.string()],
    ]),
    TyChild.make([]),
    ({ transforms, image }, _children) => {
      const opts = transforms.map(encodeURIComponent).join("/");
      return Promise.resolve(cloudinary_url + "/" + opts + "/" + image);
    }
  ),

  Component.funAsync(
    "Favicon",
    Ty.make([
      ["file", Ty.string()],
      ["width", Ty.int()],
    ]),
    TyChild.make([]),
    ({ file, width }, _children) => {
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
        }).then((metadata) => metadata.png[0].url);
        faviconCache.set(key, result);
        return result;
      }
    }
  ),

  Component.funAsync(
    "PageNumber",
    Ty.make([["pageNumber", Ty.int()]]),
    TyChild.make([]),
    ({ pageNumber }, _children) => Promise.resolve(String(pageNumber + 1))
  ),
];
