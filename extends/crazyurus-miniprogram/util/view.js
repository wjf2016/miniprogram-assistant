const vscode = require('vscode')

class TreeDataProvider {
  getChildren(element) {
    if (!element) {
      return [
        {
          command: 'miniprogramAssistant.npm',
          title: '构建',
        },
        {
          command: 'miniprogramAssistant.compile',
          title: '编译',
        },
        {
          command: 'miniprogramAssistant.preview',
          title: '预览',
        },
        {
          command: 'miniprogramAssistant.upload',
          title: '上传',
        },
      ]
    }

    return []
  }

  getTreeItem(element) {
    const treeItem = new vscode.TreeItem(element.title)
    treeItem.command = element

    return treeItem
  }
}

function activate() {
  vscode.window.registerTreeDataProvider(
    'miniprogram-view',
    new TreeDataProvider(),
  )
}

module.exports = {
  activate,
}
