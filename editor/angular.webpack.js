const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  target: "electron-renderer",
  plugins: [
    new MonacoWebpackPlugin()
  ]
};
