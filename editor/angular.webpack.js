const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  target: "electron-renderer",
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['yaml'],
      customLanguages: [
        {
          label: 'yaml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker',
          },
        },
      ]
    }
    )
  ]
};