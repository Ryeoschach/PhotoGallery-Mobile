const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 确保处理 TypeScript 文件
config.resolver.sourceExts.push('ts', 'tsx');

module.exports = config;
