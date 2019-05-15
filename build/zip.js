/**
 * Created by ChengZheLin on 2019/5/15.
 * Features:
 */

const fe = require('fs-extra')
const fs = require('fs')
const nodePath = require('path')
const archiver = require('archiver')
let package = require('../puma/package')

function resolve (path) {
  return nodePath.resolve(__dirname, `../${path}`)
}

try {
  // 清除文件
  fe.removeSync(resolve('puma.zip'))
  fe.removeSync(resolve('puma/assets'))

  // 复制文件
  fe.copySync(resolve('dist/assets'), resolve('puma/assets'))
  console.log('静态文件复制成功...')

  // 设置版本号
  let version = package.version
  version = version.split('.')
  let verLast = version.length - 1
  version[verLast] = parseInt(version[verLast]) + 1
  version = version.join('.')
  package.version = version

  fe.writeJsonSync(resolve('puma/package.json'), {...package})

  console.log('版本号写入成功...')

  // 压缩文件
  const puma = fs.createWriteStream(resolve(`puma.zip`))
  const archive = archiver('zip', {
    zlib: {
      level: 9
    }
  })

  puma.on('close', function () {
    console.log(archive.pointer() + ' total bytes')
    console.log('archiver has been finalized and the output file descriptor has closed.')
  })

  puma.on('end', function () {
    console.log('Data has been drained')
  })

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log(err)
    } else {
      throw err
    }
  })

  archive.on('error', function (err) {
    throw err
  })

  archive.pipe(puma)

  archive.glob('puma/**/*.*')

  archive.finalize()
} catch (e) {
  console.log(e)
}
