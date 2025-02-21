import path from "node:path";
import { fileURLToPath } from "node:url";
import acutis from "acutis-lang";
import featherIcons from "feather-icons";
import Image from "@11ty/eleventy-img";
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";
import postcssGlobalData from "@csstools/postcss-global-data";
import config from "../_data/config.js";

let { cloudinary_url } = config;
let { Typescheme } = acutis;
let { icons } = featherIcons;

let dirname = path.dirname(fileURLToPath(import.meta.url));

let postcssWithOptions = postcss([
  postcssGlobalData({
    files: [path.resolve(dirname, "..", "assets", "style-global-data.css")],
  }),
  postcssPresetEnv(),
]);

let postcssCache = new Map();
let faviconCache = new Map();

let Ty = Typescheme;

function cloudinaryOptions(opts, image_src) {
  let url = new URL(image_src);
  let path = url.pathname.split("/");
  path.splice(4, 0, opts);
  url.pathname = path.join("/");
  return url.href;
}

export function PostCss({ children }) {
  if (postcssCache.has(children)) {
    return postcssCache.get(children);
  } else {
    let result = postcssWithOptions
      .process(children, {
        from: undefined,
      })
      .then((result) => result.css);
    postcssCache.set(children, result);
    return result;
  }
}
PostCss.interface = Ty.make([["children", Ty.string()]]);

export function Icon(props) {
  return Promise.resolve(icons[props.name].toSvg({ class: props.class || "" }));
}
Icon.interface = Ty.make([
  ["name", Ty.string()],
  ["class", Ty.nullable(Ty.string())],
]);

export function Log(props) {
  console.log(props.val);
  return Promise.resolve("");
}
Log.interface = Ty.make([["val", Ty.unknown()]]);

export function Link(props) {
  let current =
    props.current && props.current === props.href ? "aria-current=page" : "";
  let className = props.class ? `class="${props.class}"` : "";
  let style = props.style ? `style="${props.style}"` : "";
  let tabIndex = props.tabIndex ? `tabindex=${props.tabIndex}` : "";
  return Promise.resolve(
    `<a href="${props.href}" ${className} ${current} ${style} ${tabIndex}>
      ${props.children}
    </a>`
  );
}
Link.interface = Ty.make([
  ["current", Ty.nullable(Ty.string())],
  ["href", Ty.string()],
  ["class", Ty.nullable(Ty.string())],
  ["style", Ty.nullable(Ty.string())],
  ["tabIndex", Ty.nullable(Ty.int())],
  ["children", Ty.string()],
]);

export function ImgSrc({ width, aspect, gravity, image }) {
  let height = Math.ceil(width * aspect);
  let opts = encodeURIComponent(
    `f_auto,q_auto,c_fill,g_${gravity},h_${height},w_${width}`
  );
  try {
    return Promise.resolve(cloudinaryOptions(opts, image));
  } catch (e) {
    console.warn("Invalid image URL:", image);
    return Promise.resolve(cloudinary_url + opts + image);
  }
}
ImgSrc.interface = Ty.make([
  ["width", Ty.int()],
  ["aspect", Ty.float()],
  ["gravity", Ty.string()],
  ["image", Ty.string()],
]);

export function ImgSrcStatic({ transforms, image }) {
  let opts = transforms.map(encodeURIComponent).join("/");
  try {
    return Promise.resolve(cloudinaryOptions(opts, image));
  } catch (e) {
    console.warn("Invalid image URL:", image);
    return Promise.resolve(cloudinary_url + "/" + opts + "/" + image);
  }
}
ImgSrcStatic.interface = Ty.make([
  ["transforms", Ty.list(Ty.string())],
  ["image", Ty.string()],
]);

export function Favicon({ file, width }) {
  let key = `${file}-${width}`;
  if (faviconCache.has(key)) {
    return faviconCache.get(key);
  } else {
    let result = Image(path.join(dirname, "..", file), {
      widths: [width],
      formats: ["png"],
      urlPath: "/",
      outputDir: path.join(dirname, "..", "_site"),
      filenameFormat: (_id, _src, width, format, _options) =>
        `favicon-${width}.${format}`,
    }).then((metadata) => metadata.png[0].url);
    faviconCache.set(key, result);
    return result;
  }
}
Favicon.interface = Ty.make([
  ["file", Ty.string()],
  ["width", Ty.int()],
]);

export function PageNumber({ pageNumber }) {
  return Promise.resolve(String(pageNumber + 1));
}
PageNumber.interface = Ty.make([["pageNumber", Ty.int()]]);
