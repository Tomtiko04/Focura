const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Ensure that all packages starting with @your-namespace are transpiled
          '@react-navigation',
          'react-native-reanimated',
          'react-native-gesture-handler',
        ],
      },
    },
    argv
  );

  // Customize the config before returning it
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-web': 'react-native-web',
    'react-native-svg': 'react-native-svg-web',
  };

  // Add support for .mjs files
  config.resolve.extensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    ...config.resolve.extensions,
  ];

  return config;
};
