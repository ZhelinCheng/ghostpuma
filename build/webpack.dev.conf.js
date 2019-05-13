/**
 * Created by ChengZheLin on 2019/5/6.
 * Features:
 */

'use strict'
process.env.NODE_ENV = 'development'

const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const webpackBaseFn = require('./webpack.base.conf')
const portfinder = require('portfinder')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const { wpConfig } = require('./bundle')

module.exports = new Promise((resolve, reject) => {
  const { devServer } = wpConfig
  const baseConfig = webpackBaseFn()
  const devWebpackConfig = webpackMerge(baseConfig, {
    mode: 'development',
    devServer: {
      ...devServer
    },
    plugins: [
      //热更新
      // new webpack.NamedModulesPlugin(),
      // new webpack.HotModuleReplacementPlugin()
    ]
  })

  portfinder.basePort = devServer.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [`Your application is running here: http://localhost:${port}`]
          },
          onErrors: undefined
        })
      )
      resolve(devWebpackConfig)
    }
  })
})
