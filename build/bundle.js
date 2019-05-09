/**
 * Created by ChengZheLin on 2019/5/6.
 * Features:
 */

'use strict'

const fs = require('fs')
const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const alias = require('./alias')
const resolve = (p) => path.resolve(__dirname, '..', p)
const webpackMerge = require('webpack-merge')

// 入口目录
const entryDir = resolve('src/js/page')
// 输出目录
const outputDir = resolve('dist')
// 基础HTML模板
const templatePath = fs.readFileSync(path.resolve(__dirname, './tpl.html'))
// 入口文件
const entryFiles = fs.readdirSync(entryDir)

const isDev = process.env.NODE_ENV === 'development'
const
  entry = {},
  output = {},
  htmlPlugins = []

// 默认配置
let config = {
  css: {
    // 清除冗余CSS
    purify: true
  },
  // assets目录
  assetsDir: 'assets',
  // 代理服务器
  devServer: {
    contentBase: resolve('dev'),
    port: '8080',
    host: '0.0.0.0',
    // hot: true,
    // compress: true,
    noInfo: true,
    overlay: {
      errors: true
    }
  },
  // 生产环境是否需要SourceMap
  productionSourceMap: true,
  // public目录JS是否需要SourceMap
  publicSourceMap: true,
  // 是否压缩public目录JS
  publicJsMin: true,
  // 是否生成hash
  filenameHashing: true,
  // 是否支持IE8
  ie8: false,
  // 是否使用shim
  shim: ''
}

if (fs.existsSync(resolve('wp.config.js'))) {
  let userConfig = require('../wp.config')
  config = webpackMerge(config, userConfig)
}

exports.wpConfig = config

// 设置别名
function resolveAlias () {
  Object.keys(alias).forEach(attr => {
    const val = alias[attr]
    alias[attr] = resolve(val)
  })
}

// 输出文件名配置
function resolveEntryAndOutput () {
  entryFiles.forEach(dir => {
    entry[dir.replace(/\.js$/, '')] = [resolve('src/global'), resolve(`${entryDir}/${dir}`)]

    output.filename = assetsPath('js/[name].bundle.[contenthash:6].js')
    output.path = outputDir
    output.publicPath = config.publicPath || ''
  })
}

// shim处理函数
function shimHandle (ie8, shim) {
  let html = ''

  // ie8 没有配置shim
  if (ie8 && !shim) {
    return `<script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-shim.min.js" type="text/javascript"></script>`
  }

  // 配置了shim
  if (shim) {
    let shimArr = shim instanceof Array ? shim : [shim]
    for (let item of shimArr) {
      html += `<script src="${item}" type="text/javascript"></script>\n`
    }
  }

  return html
}


// HTML模板配置
function combineHTMLWithTemplate () {
  entryFiles.forEach(dir => {
    const name = dir.replace(/\.js$/, '')
    const htmlPath = resolve(`src/${name}.html`)

    if (!fs.existsSync(htmlPath)) {
      fs.writeFileSync(htmlPath, templatePath)
    }

    htmlPlugins.push(
      new HTMLWebpackPlugin({
        title: 'Custom template',
        filename: `${name}.html`,
        template: htmlPath,
        chunks: [name, 'vendor', 'base', 'common'],
        SHIM: shimHandle(config.ie8, config.shim)
      })
    )
  })
}

function initConfig () {
  resolveAlias()
  resolveEntryAndOutput()
  combineHTMLWithTemplate()
  return {
    entry,
    output,
    htmlPlugins,
    alias
  }
}

function assetsPath (_path) {
  const assets = config.assetsDir || 'assets'

  // 生产环境图片
  if (!isDev && /^img/.test(_path)) {
    return path.posix.join(assets, _path)
  }

  // 开发环境，hash关闭
  if ((isDev || !config.filenameHashing)) {
    _path = _path.replace(/\.\[[a-z]*hash(:\d+)?]/, '')
  }

  return path.posix.join(assets, _path)
}

exports.assetsPath = assetsPath

exports.initConfig = initConfig
exports.resolve = resolve
