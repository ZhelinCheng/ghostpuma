/**
 * Created by ChengZheLin on 2019/5/6.
 * Features:
 */
'use strict'
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const webpackBaseFn = require('./webpack.base.conf')
const webpackMerge = require('webpack-merge')
const glob = require('glob')
const {wpConfig} = require('./bundle')

function f () {
  const baseConfig = webpackBaseFn()

  // 判断是否删除冗余css
  if (wpConfig.css.purify) {
    baseConfig.plugins.push(
      new PurgecssPlugin({
        paths: glob.sync(path.join(__dirname, '../src/**/*'), {nodir: true})
      })
    )
  }

  return webpackMerge(baseConfig, {
    mode: 'production',
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          /*common: {
            chunks: 'initial',
            name: 'common',
            minSize: 1,
            priority: -10
          },*/
          vendors: {
            chunks: 'initial',
            // test: /[\\/]node_modules[\\/]/,
            minChunks: 1,
            priority: -10,
            name: 'vendor',
            reuseExistingChunk: true
          },
          /*base: {
            name: 'base',
            test: /\.(le|c)ss$/,
            chunks: 'all',
            // enforce: true,
            minSize: 2000,
            priority: -20,
          },*/
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      },
      minimizer: [
        new UglifyJsPlugin({
          sourceMap: wpConfig.productionSourceMap,
          cache: true,
          parallel: true,
          exclude: /\.min\.js$/,
          uglifyOptions: {
            ie8: wpConfig.ie8,
            compress: {
              warnings: false,
              drop_debugger: false,
              drop_console: true
            }
          }
        })
      ]
    },
    plugins: [
      new CleanWebpackPlugin({
        verbose: false,
        dry: false
      })
    ]
  })
}

module.exports = f()
