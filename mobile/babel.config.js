module.exports = function(api) {
  api.cache(true);
  
  const isWeb = process.env.PLATFORM === 'web' || process.env.BUILD_TARGET === 'web';
  
  const presets = [
    'babel-preset-expo',
    isWeb && [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: '3.8',
        targets: {
          node: 'current',
          browsers: ['>0.25%', 'not dead', 'not ie 11', 'not op_mini all'],
        },
      },
    ],
  ].filter(Boolean);

  const plugins = [
    'react-native-reanimated/plugin',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true,
      corejs: false,
    }],
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      safe: false,
      allowUndefined: true,
    }],
    ['module-resolver', {
      root: ['./src'],
      extensions: [
        '.ios.js',
        '.android.js',
        '.ios.jsx',
        '.android.jsx',
        '.js',
        '.jsx',
        '.json',
        '.tsx',
        '.ts',
      ],
      alias: {
        "@": "./src",
        "react-native$": "react-native-web"
      }
    }],
  ];

  // Only add these plugins for web builds
  if (isWeb) {
    plugins.push(
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }]
    );
  }

  return {
    presets,
    plugins,
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
