// Learn more https://docs.expo.io/guides/customizing-metro
const dotenv = require("dotenv");
dotenv.config(); // This loads the .env file

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Add polyfills for Node.js modules
const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      // Core Node modules
      stream: require.resolve('stream-browserify'),
      http: require.resolve('http-browserify'),
      https: require.resolve('http-browserify'),
      crypto: require.resolve('crypto-browserify'),
      events: require.resolve('events'),
      path: require.resolve('path-browserify'),
      net: require.resolve('react-native-tcp-socket'),
      tls: require.resolve('tls-browserify'),
      url: require.resolve('url-browserify'),
      zlib: require.resolve('browserify-zlib'),
      util: require.resolve('util/'),
      assert: require.resolve('assert/'),
      fs: false,
    },
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs']
  },
};

module.exports = config;
