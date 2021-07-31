const vscode = require('vscode')

/**
 * 转为小写命名
 *
 * @param {boolean} [toUppercase=false] 是否转为大写
 */
function toLowerCase(file, toUppercase = false) {
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

    editBuilder.replace(
      selection,
      toUppercase ? selectedText.toUpperCase() : selectedText.toLowerCase(),
    )
  })
}

/**
 * 转为大写命名
 *
 * @returns
 */
function toUppercase() {
  return toLowerCase('', true)
}

/**
 * 转为驼峰命名
 *
 * @param {boolean} [Uppercase=false] 是否转为大驼峰命名
 */
function toCamelCase(file, Uppercase = false) {
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

    let newText = selectedText

    newText = newText.replace(/[-_ ](.)/g, function(match, p1) {
      return p1.toUpperCase()
    })

    newText = newText.replace(/^(.)/, function(match, p1) {
      return Uppercase ? p1.toUpperCase() : p1.toLowerCase()
    })

    editBuilder.replace(selection, newText)
  })
}

/**
 * 转为大驼峰命名
 *
 * @returns
 */
function toCamelCaseUppercase() {
  return toCamelCase('', true)
}

/**
 * 转为下划线命名
 *
 * @param {boolean} [Uppercase=false] 是否转为大写下划线命名
 */
function toUnderline(file, Uppercase = false) {
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

    let newText = selectedText

    // 处理中划线和空格分割的命名
    if (/[- ]/.test(selectedText)) {
      newText = newText.replace(/[- ]/g, '_')
    } else {
      // 处理驼峰命名
      newText = newText.replace(/(?<!^)([A-Z])/g, function(match, p1, p2) {
        return `_${p1}`
      })
    }

    newText = Uppercase ? newText.toUpperCase() : newText.toLowerCase()

    // 更新编辑器内容
    editBuilder.replace(selection, newText)
  })
}

/**
 * 转为大写下划线命名
 *
 * @returns
 */
function toUnderlineUppercase() {
  return toUnderline('', true)
}

/**
 * 转为中划线命名
 *
 * @param {*} Uppercase 是否转为大写中划线命名
 */
function toThroughLine(file, Uppercase) {
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

    let newText = selectedText

    // 处理中划线和空格分割的命名
    if (/[_ ]/.test(selectedText)) {
      newText = newText.replace(/[_ ]/g, '-')
    } else {
      // 处理驼峰命名
      newText = newText.replace(/(?<!^)([A-Z])/g, function(match, p1) {
        return `-${p1}`
      })
    }

    // 更新编辑器内容
    editBuilder.replace(
      selection,
      Uppercase ? newText.toUpperCase() : newText.toLowerCase(),
    )
  })
}

/**
 * 转为大写中划线命名
 *
 * @returns
 */
function toThroughLineUppercase() {
  return toThroughLine('', true)
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `miniprogramAssistant.toLowerCase`,
      toLowerCase,
    ),
    vscode.commands.registerCommand(
      `miniprogramAssistant.toUppercase`,
      toUppercase,
    ),
    vscode.commands.registerCommand(
      `miniprogramAssistant.toCamelCase`,
      toCamelCase,
    ),
    vscode.commands.registerCommand(
      `miniprogramAssistant.toCamelCaseUppercase`,
      toCamelCaseUppercase,
    ),
    vscode.commands.registerCommand(
      `miniprogramAssistant.toUnderline`,
      toUnderline,
    ),
    vscode.commands.registerCommand(
      `miniprogramAssistant.toUnderlineUppercase`,
      toUnderlineUppercase,
    ),
    vscode.commands.registerCommand(
      `miniprogramAssistant.toThroughLine`,
      toThroughLine,
    ),
    vscode.commands.registerCommand(
      `miniprogramAssistant.toThroughLineUppercase`,
      toThroughLineUppercase,
    ),
  )
}

module.exports = {
  activate,
}
