module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@config': './src/config',
            '@constants': './src/constants',
          },
        },
      ],
    ],
  };
};