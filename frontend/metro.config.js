// Learn more https://docs.expo.io/guides/customizing-metro
const dotenv = require("dotenv");
dotenv.config(); // This loads the .env file

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
