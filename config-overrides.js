const { override, overrideDevServer } = require('customize-cra');

module.exports = override(
  // webpack設定のカスタマイズ
);

const devServerConfig = () => (config) => {
  // webpack-dev-server 5では onAfterSetupMiddleware が setupMiddlewares に変更された
  if (config.onBeforeSetupMiddleware || config.onAfterSetupMiddleware) {
    config.setupMiddlewares = (middlewares, devServer) => {
      if (config.onBeforeSetupMiddleware) {
        config.onBeforeSetupMiddleware(devServer);
      }

      if (config.onAfterSetupMiddleware) {
        config.onAfterSetupMiddleware(devServer);
      }

      return middlewares;
    };

    delete config.onBeforeSetupMiddleware;
    delete config.onAfterSetupMiddleware;
  }

  // webpack-dev-server 5では https は server.type に変更された
  if (config.https) {
    config.server = {
      type: 'https',
      options: typeof config.https === 'object' ? config.https : {}
    };
    delete config.https;
  }

  return config;
};

module.exports.devServer = overrideDevServer(devServerConfig());
