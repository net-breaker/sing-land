const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

const MONACO_DIR = path.join(__dirname, "node_modules/monaco-editor");

module.exports = {
  target: "electron-renderer",
  module: {
    rules: [
      {
        test: /\.css$/,
        include: MONACO_DIR,
        use: ["css-loader"]
      },
      {
        test: /\.node$/,
        use: "raw-loader"
      }
    ]
  },
  plugins: [new MonacoWebpackPlugin()]
};
