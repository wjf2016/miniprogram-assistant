const vscode = require('vscode')
const commands = require('./commands/index')

function activate(context) {
  context.subscriptions.push(
    // 注册创建页面命令
    vscode.commands.registerCommand(
      `miniprogramAssistant.createPage`,
      commands.page,
    ),
    // 注册创建组件命令
    vscode.commands.registerCommand(
      `miniprogramAssistant.createComponent`,
      commands.component,
    ),
  )
}

module.exports = {
  activate,
}
