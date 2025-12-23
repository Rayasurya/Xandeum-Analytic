const fs = require("fs");

module.exports = {
  devServer: (devServerConfig, {env, paths}) => {
    devServerConfig = {
      devMiddleware: {
        publicPath: "/ria/",
        writeToDisk: true,
      },
      onBeforeSetupMiddleware: undefined,
      onAfterSetupMiddleware: undefined,
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }

        if (fs.existsSync(paths.proxySetup)) {
          require(paths.proxySetup)(devServer.app);
        }

        const evalSourceMap = require("react-dev-utils/evalSourceMapMiddleware");
        const redirectServedPath = require("react-dev-utils/redirectServedPathMiddleware");
        const noopServiceWorker = require("react-dev-utils/noopServiceWorkerMiddleware");

        middlewares.push(
          evalSourceMap(devServer),
          redirectServedPath(paths.publicUrlOrPath),
          noopServiceWorker(paths.publicUrlOrPath)
        );

        return middlewares;
      },
    };
    return devServerConfig;
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.optimization = webpackConfig.optimization ?? {};
      webpackConfig.optimization.runtimeChunk = false;
      webpackConfig.resolve.fallback = webpackConfig.resolve.fallback || {}
      webpackConfig.resolve.fallback.path = webpackConfig.resolve.fallback.path ?? require.resolve("path-browserify")
      return webpackConfig;
    },
  },
};
