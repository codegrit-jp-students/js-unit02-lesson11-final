const path = require('path');
const webpack = require('webpack');

let envPath = '.env';
if (process.env.BUILD_ENV === 'prod') envPath = '.env.production';

const dotenv = require('dotenv').config({ path: path.resolve(__dirname, envPath) });

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: './bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        'style-loader', // creates style nodes from JS strings
        'css-loader', // translates CSS into CommonJS
        'sass-loader', // compiles Sass to CSS
      ],
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
      options: {
        // eslint options (if necessary)
      },
    }],
  },
  devServer: {
    hot: true,
    hotOnly: true,
    watchContentBase: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
  ],
};
