const path = require("path");
const { Component, Typescheme } = require("acutis-lang");
const { icons } = require("feather-icons");
const Image = require("@11ty/eleventy-img");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const postcssGlobalData = require("@csstools/postcss-global-data");
const { cloudinary_url } = require("../_data/config.json");

const postcssWithOptions = postcss([
  postcssGlobalData({
    files: [path.resolve(__dirname, "..", "assets", "style-global-data.css")],
  }),
  postcssPresetEnv(),
]);

const postcssCache = new Map();
const faviconCache = new Map();

const Ty = Typescheme;

function cloudinaryOptions(opts, image_src) {
  const url = new URL(image_src);
  const path = url.pathname.split("/");
  path.splice(4, 0, opts);
  url.pathname = path.join("/");
  return url.href;
}

module.exports = [
  Component.funAsync(
    "PostCss",
    Ty.make([["children", Ty.string()]]),
    ({ children }) => {
      if (postcssCache.has(children)) {
        return postcssCache.get(children);
      } else {
        const result = postcssWithOptions
          .process(children, {
            from: undefined,
          })
          .then((result) => result.css);
        postcssCache.set(children, result);
        return result;
      }
    }
  ),

  Component.funAsync(
    "Icon",
    Ty.make([
      ["name", Ty.string()],
      ["class", Ty.nullable(Ty.string())],
    ]),
    (props) =>
      Promise.resolve(icons[props.name].toSvg({ class: props.class || "" }))
  ),

  Component.funAsync("Log", Ty.make([["val", Ty.unknown()]]), (props) => {
    console.log(props.val);
    return Promise.resolve("");
  }),

  Component.funAsync(
    "Link",
    Ty.make([
      ["current", Ty.nullable(Ty.string())],
      ["href", Ty.string()],
      ["class", Ty.nullable(Ty.string())],
      ["style", Ty.nullable(Ty.string())],
      ["tabIndex", Ty.nullable(Ty.int())],
      ["children", Ty.string()],
    ]),
    (props) => {
      const current =
        props.current && props.current === props.href
          ? "aria-current=page"
          : "";
      const className = props.class ? `class="${props.class}"` : "";
      const style = props.style ? `style="${props.style}"` : "";
      const tabIndex = props.tabIndex ? `tabindex=${props.tabIndex}` : "";
      return Promise.resolve(
        `<a href="${props.href}" ${className} ${current} ${style} ${tabIndex}>
            ${props.children}
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
    ({ width, aspect, gravity, image }) => {
      const height = Math.ceil(width * aspect);
      const opts = encodeURIComponent(
        "f_auto," +
          "q_auto," +
          "c_fill," +
          `g_${gravity},` +
          `h_${height},` +
          `w_${width}`
      );
      try {
        return Promise.resolve(cloudinaryOptions(opts, image));
      } catch (e) {
        console.warn("Invalid image URL:", image);
        return Promise.resolve(cloudinary_url + opts + image);
      }
    }
  ),

  Component.funAsync(
    "ImgSrcStatic",
    Ty.make([
      ["transforms", Ty.list(Ty.string())],
      ["image", Ty.string()],
    ]),
    ({ transforms, image }) => {
      const opts = transforms.map(encodeURIComponent).join("/");
      try {
        return Promise.resolve(cloudinaryOptions(opts, image));
      } catch (e) {
        console.warn("Invalid image URL:", image);
        return Promise.resolve(cloudinary_url + "/" + opts + "/" + image);
      }
    }
  ),

  Component.funAsync(
    "Favicon",
    Ty.make([
      ["file", Ty.string()],
      ["width", Ty.int()],
    ]),
    ({ file, width }) => {
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
    ({ pageNumber }) => Promise.resolve(String(pageNumber + 1))
  ),
];
