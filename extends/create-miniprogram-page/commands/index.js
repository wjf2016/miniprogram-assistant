const vscode = require('vscode')
const fs = require('fs-extra')
const path = require('path')
const types = {
  page: '页面',
  component: '组件',
}

const copyFile = function(pageDir, pageSource, type) {
  // 目录不存在时，使用默认模板

  if (!fs.pathExistsSync(pageDir)) {
    // 页面/组件所在目录不存在
    vscode.window.showErrorMessage(`${types[type]}所在目录不存在！`)
    return
  }

  if (!fs.pathExistsSync(pageSource)) {
    // 页面/组件模板不存在
    vscode.window.showErrorMessage(`${types[type]}模板不存在！`)
    return
  }

  // 预设路径为当前目录
  vscode.window
    .showInputBox({
      placeHolder: `请输入${types[type]}目录名称`,
      prompt: `请输入${types[type]}目录名称`,
    })
    .then((pageName) => {
      if (pageName) {
        const targetPath = path.join(pageDir, pageName)
        fs.ensureDirSync(targetPath)
        fs.copySync(pageSource, targetPath)
      } else {
        vscode.window.showErrorMessage('名称不能为空！')
      }
    })
}

const createPage = function(type, url) {
  let pageSource

  if (type === 'page') {
    pageSource = vscode.workspace
      .getConfiguration()
      .get('miniprogramAssistant.create.pageSource')
  } else {
    pageSource = vscode.workspace
      .getConfiguration()
      .get('miniprogramAssistant.create.componentSource')
  }

  // 目录不存在时，使用默认模板
  if (!fs.pathExistsSync(pageSource)) {
    pageSource = path.join(path.dirname(__filename), `../template/${type}`)
  }

  if (!url) {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
    const { activeTextEditor } = vscode.window
    let currentFileDir

    if (activeTextEditor) {
      const currentFilePath = activeTextEditor.document.fileName
      currentFileDir = path.dirname(currentFilePath)
    }

    vscode.window
      .showInputBox({
        placeHolder: `请输入${types[type]}所在目录路径`,
        prompt: `请输入${types[type]}所在目录路径`,
        value: currentFileDir || rootPath,
      })
      .then((pageDir) => {
        if (pageDir) {
          copyFile(pageDir, pageSource, type)
        } else {
          vscode.window.showErrorMessage('路径不能为空！')
        }
      })

    return
  }

  copyFile(url.fsPath, pageSource, type)
}

const commands = {
  page: function(url) {
    return createPage('page', url)
  },
  component: function(url) {
    return createPage('component', url)
  },
}

module.exports = commands
