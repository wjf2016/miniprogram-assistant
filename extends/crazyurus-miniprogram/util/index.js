const vscode = require('vscode')
const path = require('path')
const fs = require('fs-extra')

function getRootPath() {
  let rootPath = ''

  if (Array.isArray(vscode.workspace.workspaceFolders)) {
    rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
    rootPath = rootPath.replace(/([a-z]):/i, function(match) {
      return match.toUpperCase()
    })
  }

  return rootPath
}

function getProjectConfig() {
  const rootPath = getRootPath()

  if (rootPath) {
    const projectConfigJson = path.join(rootPath, 'project.config.json')

    if (fs.pathExistsSync(projectConfigJson)) {
      return fs.readJsonSync(projectConfigJson)
    }
    return null
  }

  return null
}

const util = {
  getRootPath,
  getProjectConfig,
}

module.exports = util
