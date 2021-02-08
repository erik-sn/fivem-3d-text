const webpack = require('webpack');
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');

const buildPath = path.resolve(__dirname, 'dist');

const index = {
  entry: './src/client/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader', 'eslint-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new RemovePlugin({
      before: {
        include: [
          path.resolve(buildPath)
        ]
      },
      watch: {
        include: [
          path.resolve(buildPath)
        ]
      }
    })
  ],
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[contenthash].index.js',
    path: path.resolve(buildPath),
  },
};

module.exports = [index];
