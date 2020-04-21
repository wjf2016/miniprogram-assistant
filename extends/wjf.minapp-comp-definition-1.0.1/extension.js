const vscode = require('vscode')
const wxmlCompletionItemProvider = require('./util/wxmlCompletionItemProvider')
const wxmlDefinitionProvider = require('./util/wxmlDefinitionProvider')
const documentSelector = [
  { scheme: 'file', language: 'wxml', pattern: '**/*.wxml' },
]

function activate(context) {
  console.log('minapp-comp-definition is now active!')

  // 注册跳转到定义
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      documentSelector,
      wxmlDefinitionProvider,
    ),
  )

  // 注册自动补全提示，只有当按下空格时才触发
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      documentSelector,
      wxmlCompletionItemProvider,
      ...[' '],
    ),
  )
}

module.exports = {
  activate,
}
