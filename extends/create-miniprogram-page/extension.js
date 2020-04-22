const vscode = require('vscode')
const commands = require('./commands/index')

function activate(context) {
  context.subscriptions.push(
    // 注册创建页面命令
    vscode.commands.registerCommand(
      `miniprogramAssistant.create.page`,
      commands.page,
    ),
    // 注册创建组件命令
    vscode.commands.registerCommand(
      `miniprogramAssistant.create.component`,
      commands.component,
    ),
  )
}

module.exports = {
  activate,
}
