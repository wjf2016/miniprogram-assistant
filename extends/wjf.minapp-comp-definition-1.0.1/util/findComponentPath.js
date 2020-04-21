const path = require('path')
const fs = require('fs')

const appFile = 'app.json'

function findRootPath(filePath) {
  const dir = path.dirname(filePath)
  const files = fs.readdirSync(dir)

  if (files.includes(appFile)) {
    return dir
  } else {
    return findRootPath(dir)
  }
}

const findComponentPath = function(doc, componentName) {
  const filePath = doc.fileName
  const rootPath = findRootPath(filePath)
  let baseDir = path.dirname(filePath)
  let configFile = path.join(
    baseDir,
    `${path.basename(filePath, '.wxml')}.json`,
  )
  let componentConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'))
  let componentPath

  // 页面无配置时，查找全局配置
  if (
    !componentConfig.usingComponents ||
    !componentConfig.usingComponents[componentName]
  ) {
    configFile = path.join(rootPath, appFile)
    componentConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'))
    baseDir = rootPath
  }

  if (
    componentConfig.usingComponents &&
    componentConfig.usingComponents[componentName]
  ) {
    componentPath = `${componentConfig.usingComponents[componentName]}.js`
  }

  if (!componentPath) {
    return ''
  }

  if (componentPath.startsWith('/')) {
    // 为绝对路径时
    componentPath = path.join(rootPath, componentPath)
  } else {
    // 为相对路径时
    componentPath = path.resolve(baseDir, componentPath)
  }

  return componentPath
}

module.exports = findComponentPath
