const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => ({
  mode: 'development',
  optimization: {
    minimizer: [
      //new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: false }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  // entry: {
  //     './src/app.js': ['./src/app.ts'].concat(glob.sync('./vendor/**/*.js'))
  // },
  entry: [ './css/app.scss', './css/status.scss', './ts/app.ts' ],
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, './public')
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'app.css' }),
    new MiniCssExtractPlugin({ filename: 'status.css' })
    //new CopyWebpackPlugin([{ from: 'static/', to: '../' }])
  ]
});
