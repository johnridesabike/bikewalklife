const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

const isDev = process.env.NODE_ENV !== "production";
const cssVariables = path.resolve(__dirname, "assets", "variables.css");
const cssMedia = path.resolve(__dirname, "assets", "custom-media.css");

module.exports = {
  mode: isDev ? "development" : "production",
  stats: {
    colors: true,
    preset: "minimal",
  },
  performance: { hints: isDev ? false : "warning" },
  // Eval does not work for css source maps
  // `All values enable source map generation except eval and false value.`
  // https://github.com/webpack-contrib/css-loader
  devtool: isDev ? "cheap-module-source-map" : "source-map",
  entry: {
    contact: {
      import: path.resolve(__dirname, "assets", "contact-form-client.mjs"),
      dependOn: "shared",
    },
    webmentions: {
      import: path.resolve(__dirname, "assets", "webmentions-client.mjs"),
      dependOn: "shared",
    },
    // This is a little awkward to maintain
    shared: [
      "react",
      "react-dom",
      "bs-platform/lib/es6/curry.js",
      "bs-platform/lib/es6/belt_Array.js",
      "bs-platform/lib/es6/caml_option.js",
      "bs-fetch/lib/es6/src/Fetch.bs.js",
    ],
    style: path.resolve(__dirname, "assets", "style.css"),
  },
  output: {
    filename: isDev ? "[name].js" : "[name].[contenthash].js",
    path: path.resolve(__dirname, "_site", "assets"),
    publicPath: "/assets/",
  },
  plugins: [
    new WebpackManifestPlugin(),
    new MiniCssExtractPlugin({
      filename: isDev ? "[name].css" : "[name].[contenthash].css",
    }),
  ],
  optimization: isDev
    ? {}
    : {
        minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
      },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.s?css/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    {
                      importFrom: [cssVariables, cssMedia],
                    },
                  ],
                  /* The postcss-custom-media built in with postcss-preset-env
                     doesn't work. */
                  [
                    "postcss-custom-media",
                    {
                      importFrom: cssMedia,
                    },
                  ],
                  "postcss-normalize",
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: `fonts/${isDev ? "[name][ext]" : "[contenthash][ext]"}`,
        },
      },
    ],
  },
  resolve: {},
};
