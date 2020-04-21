const vscode = require('vscode')
const findComponentPath = require('./findComponentPath')
const wxTags = require('./wxTags')

const provideDefinition = function(document, position) {
  const textLine = document.lineAt(position)
  const wordRange = document.getWordRangeAtPosition(position, /[\w|\-]+\b/)
  const tag = (textLine.text.match(/(?<=<\/?)[\w|\-]+\b/) || [])[0]
  const word = document.getText(wordRange)

  if (!wordRange) {
    return null
  }

  if (!tag) {
    return null
  }

  if (tag !== word) {
    return null
  }

  if (wxTags.includes(tag)) {
    return []
  }

  const componentPath = findComponentPath(document, tag)

  if (!componentPath) {
    return null
  }

  return new vscode.Location(
    vscode.Uri.file(componentPath),
    new vscode.Position(0, 0),
  )
}

module.exports = {
  provideDefinition,
}
