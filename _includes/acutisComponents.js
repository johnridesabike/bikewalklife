import path from "node:path";
import { fileURLToPath } from "node:url";
import FeatherIcons from "feather-icons";
import * as SimpleIcons from "simple-icons";
import Image from "@11ty/eleventy-img";
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";
import postcssGlobalData from "@csstools/postcss-global-data";
import config from "../_data/config.js";

let { cloudinary_url } = config;

let dirname = path.dirname(fileURLToPath(import.meta.url));

let postcssWithOptions = postcss([
  postcssGlobalData({
    files: [path.resolve(dirname, "..", "assets", "style-global-data.css")],
  }),
  postcssPresetEnv(),
]);

let postcssCache = new Map();
let faviconCache = new Map();

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
PostCss.interface = { children: "string" };

export function Icon(props) {
  return FeatherIcons.icons[props.name].toSvg({ class: props.class || "" });
}
Icon.interface = {
  name: "string",
  class: ["nullable", "string"],
};

export function Log(props) {
  console.log(props.val);
  return "";
}
Log.interface = { val: "_" };

export function Link(props) {
  let current =
    props.current && props.current === props.href ? "aria-current=page" : "";
  let className = props.class ? `class="${props.class}"` : "";
  let style = props.style ? `style="${props.style}"` : "";
  let tabIndex = props.tabIndex ? `tabindex=${props.tabIndex}` : "";
  return `
    <a href="${props.href}" ${className} ${current} ${style} ${tabIndex}>
      ${props.children}
    </a>`;
}
Link.interface = {
  current: ["nullable", "string"],
  href: "string",
  class: ["nullable", "string"],
  style: ["nullable", "string"],
  tabIndex: ["nullable", "int"],
  children: "string",
};

export function ImgSrc({ width, aspect, gravity, image }) {
  let height = Math.ceil(width * aspect);
  let opts = [`c_fill,g_${gravity},h_${height},w_${width}`, "f_auto,q_auto"]
    .map(encodeURIComponent)
    .join("/");
  try {
    return cloudinaryOptions(opts, image);
  } catch (e) {
    console.warn("Invalid image URL:", image);
    console.warn(e);
    return cloudinary_url + opts + image;
  }
}
ImgSrc.interface = {
  width: "int",
  aspect: "float",
  gravity: "string",
  image: "string",
};

export function ImgSrcStatic({ transforms, image }) {
  let opts = transforms.map(encodeURIComponent).join("/");
  try {
    return cloudinaryOptions(opts, image);
  } catch (e) {
    console.warn("Invalid image URL:", image);
    console.warn(e);
    return cloudinary_url + "/" + opts + "/" + image;
  }
}
ImgSrcStatic.interface = {
  transforms: ["list", "string"],
  image: "string",
};

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
Favicon.interface = {
  file: "string",
  width: "int",
};

export function PageNumber({ pageNumber }) {
  return String(pageNumber + 1);
}
PageNumber.interface = { pageNumber: "int" };

export function SimpleIcon(props) {
  let icon = SimpleIcons["si" + props.name];
  return `<svg
      role="img"
      viewBox="0 0 24 24"
      height="24"
      width="24"
      class="${props.class}"
      style="fill: #${icon.hex}"
      aria-hidden="true">
      <path d="${icon.path}" />
    </svg>`;
}
SimpleIcon.interface = {
  name: "string",
  class: ["nullable", "string"],
};
