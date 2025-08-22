// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
  // Add additional asset extensions
  assetExts: ['db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg', 'gif', 'svg'],
  // Add additional source extensions
  sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'mjs', 'cjs'],
  // Enable watch folders
  watchFolders: [
    __dirname,
    path.join(__dirname, '..', 'shared')
  ],
});

// Enable web support
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Add resolver for web platform
config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = config;
