const createExpoWebpackConfig = require('@expo/webpack-config');
const { resolve } = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfig(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['focura-shared']
      }
    },
    argv
  );

  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util/'),
    buffer: require.resolve('buffer/'),
    path: require.resolve('path-browserify'),
    fs: false,
    os: false,
    http: false,
    https: false,
    zlib: false,
  };

  // Add polyfills
  config.plugins = (config.plugins || []).concat([
    new (require('webpack').ProvidePlugin)({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  // Ignore problematic modules
  config.ignoreWarnings = [
    /Failed to parse source map/, // Ignore source map warnings
    /react-native-web/, // Ignore react-native-web warnings
    /expo-notifications/, // Ignore expo-notifications warnings
  ];

  // Alias react-native to react-native-web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-webview': 'react-native-web-webview',
    'crypto': 'crypto-browserify',
    'stream': 'stream-browserify',
    'process': 'process/browser',
  };

  return config;
};
