const vscode = require('vscode')
const findComponentPath = require('./findComponentPath')
const getProperties = require('./getProperties')
const wxTags = require('./wxTags')

// 激活自动完成功能
const provideCompletionItems = function(document, position, token, context) {
  const textLine = document.lineAt(position)
  let tag = (textLine.text.match(/(?<=<\/?)[\w|\-]+\b/) || [])[0]

  // 光标所在的行为空行时
  if (textLine.isEmptyOrWhitespace) {
    return null
  }

  // 未找到组件名时
  if (!tag) {
    // 向前搜索开始标签
    const regex = new RegExp(`(?<=<([a-zA-Z-]+\\b).*?)${textLine.text}`, 's')
    // 搜索范围为第一行至当前光标所在行
    const searchRange = new vscode.Range(
      document.lineAt(0).range.start,
      textLine.range.end,
    )
    const searchStr = document.getText(searchRange)
    const regexResult = regex.exec(searchStr)

    if (!regexResult) {
      return null
    }

    tag = regexResult[1]
  }

  // 跳过微信自带组件
  if (wxTags.includes(tag)) {
    return null
  }

  const componentPath = findComponentPath(document, tag)

  if (!componentPath) {
    return null
  }

  const properties = getProperties(componentPath)

  const completionItemArr = properties.map((item) => {
    const completionItem = new vscode.CompletionItem(
      item.name,
      vscode.CompletionItemKind.Property,
    )
    completionItem.insertText = new vscode.SnippetString(item.insertText)
    completionItem.documentation = item.documentation

    return completionItem
  })

  return completionItemArr
}

// 选中自动完成项目时
const resolveCompletionItem = function(item, token) {
  return item
}

module.exports = {
  provideCompletionItems,
  resolveCompletionItem,
}
