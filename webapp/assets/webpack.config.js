const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => ({
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: false }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  //entry: './js/app.js',
  entry: [ './css/app.scss', './js/main.ts' ],
  //entry: './js/main.ts',
  devtool: 'inline-source-map',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, '../priv/static/js')
  },
  watchOptions: {
    poll: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }

      //   test: /\.(sa|sc|c)ss$/,
      //   use: [
      //     //devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
      //     'css-loader',
      //     //'postcss-loader',
      //     'sass-loader',
      //   ],
      // }

      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader'
      //   }
      // },
      // {
      //   test: /\.css$/,
      //   use: [MiniCssExtractPlugin.loader, 'css-loader']
      // }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '../css/app.css' }),
    new CopyWebpackPlugin([{ from: 'static/', to: '../' }]),
    //new WebpackNotifierPlugin(),
  ]
});

