const vscode = require('vscode')

class TreeDataProvider {
  getChildren(element) {
    if (!element) {
      return [
        {
          command: 'MiniProgram.commands.npm',
          title: '构建',
        },
        {
          command: 'MiniProgram.commands.compile',
          title: '编译',
        },
        {
          command: 'MiniProgram.commands.preview',
          title: '预览',
        },
        {
          command: 'MiniProgram.commands.upload',
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
