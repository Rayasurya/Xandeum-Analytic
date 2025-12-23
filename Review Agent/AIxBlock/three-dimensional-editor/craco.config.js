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
    configure: (cfg) => {
      cfg.optimization = cfg.optimization ?? {};
      cfg.optimization.runtimeChunk = false;
      cfg.resolve.fallback = cfg.resolve.fallback || {};
      cfg.resolve.fallback.path = cfg.resolve.fallback.path ?? require.resolve("path-browserify");
      cfg.module = cfg.module ?? {};
      cfg.module.parser = cfg.module.parser ?? {};
      cfg.module.parser.javascript = cfg.module.parser.javascript ?? {};
      cfg.module.parser.javascript.exportsPresence = false;
      return cfg;
    },
  },
};
