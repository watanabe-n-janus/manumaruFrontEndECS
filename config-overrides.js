const { override, overrideDevServer, disableEsLint } = require('customize-cra');

module.exports = override(
  // eslintを一時的に無効化（eslint-webpack-pluginの互換性問題のため）
  disableEsLint(),
  // eslint-webpack-pluginを完全に削除
  (config) => {
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin'
    );
    return config;
  }
);

const devServerConfig = () => (config) => {
  // webpack-dev-server 4.xを使用しているため、特別な変換は不要
  // 必要に応じてカスタマイズを追加可能
  return config;
};

module.exports.devServer = overrideDevServer(devServerConfig());
