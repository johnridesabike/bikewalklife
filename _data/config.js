/* This file is temporary until Eleventy supports the `with {type : "json"}`
 * import attribute during --serve. */

import { readFileSync } from "node:fs";

export default JSON.parse(
  readFileSync(new URL("./config.json", import.meta.url))
);
