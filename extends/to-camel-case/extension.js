const vscode = require('vscode')

// 转为驼峰命名
function toCamelCase() {
  const { activeTextEditor } = vscode.window

  if (!activeTextEditor) {
    return
  }

  const { selection, document } = activeTextEditor

  if (selection.isEmpty) {
    return
  }

  activeTextEditor.edit(function(editBuilder) {
    const selectedText = document.getText(
      new vscode.Range(selection.start, selection.end),
    )
    const newText = selectedText.replace(/[-_](.)/g, function(match, p1) {
      return p1.toUpperCase()
    })

    editBuilder.replace(selection, newText)
  })
}

// 转为下划线命名
function toUnderline() {
  const { activeTextEditor } = vscode.window

  if (!activeTextEditor) {
    return
  }

  const { selection, document } = activeTextEditor

  if (selection.isEmpty) {
    return
  }

  activeTextEditor.edit(function(editBuilder) {
    const selectedText = document.getText(
      new vscode.Range(selection.start, selection.end),
    )
    const newText = selectedText.replace(/([A-Z])/g, function(match, p1) {
      return `_${p1.toLowerCase()}`
    })

    editBuilder.replace(selection, newText)
  })
}

function activate(context) {
  context.subscriptions.push(
    // 注册“转为驼峰命名”命令
    vscode.commands.registerCommand(
      `miniprogramAssistant.toCamelCase`,
      toCamelCase,
    ),
    // 注册“转为下划线命名”命令
    vscode.commands.registerCommand(
      `miniprogramAssistant.toUnderline`,
      toUnderline,
    ),
  )
}

module.exports = {
  activate,
}
