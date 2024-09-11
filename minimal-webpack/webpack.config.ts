/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import type { Configuration, RuleSetRule } from "webpack";

import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Dotenv from "dotenv-webpack";

const devServer: Configuration["devServer"] = {
  port: 3000,
  open: true,
  hot: true,
};

const output: Configuration["output"] = {
  path: path.join(__dirname, "dist"),
  filename: "app.bundle.js",
  clean: true,
  publicPath: "/",
};

const rules: RuleSetRule[] = [
  { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
];

const plugins: Configuration["plugins"] = [
  new Dotenv(),
  new webpack.EnvironmentPlugin({ NODE_ENV: "development" }),
  new HtmlWebpackPlugin({
    template: path.join(__dirname, "index.html"),
    title: "OnlinePayments SDK Client JS Example Webpack",
  }),
];

const extensions = [".ts", ".js"];

const config: Configuration = {
  entry: "./src/app.ts",
  devtool: "inline-source-map",
  mode: "development",
  context: __dirname,
  devServer,
  output,
  plugins,
  module: { rules },
  resolve: { extensions },
};

export default config;
