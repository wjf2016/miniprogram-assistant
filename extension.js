const minappCompDefinition = require('./extends/wjf.minapp-comp-definition-1.0.1/extension')
const minappVscode = require('./extends/qiu8310.minapp-vscode-2.2.2/dist/extension')
const wxmlVscode = require('./extends/cnyballk.wxml-vscode-0.1.2/dist/extension')

function activate(context) {
  console.log('miniprogram-assistant is now active!')

  minappCompDefinition.activate(context)
  minappVscode.activate(context)
  wxmlVscode.activate(context)
}

function deactivate() {
  minappVscode.deactivate()
  wxmlVscode.deactivate()
}

function schemes(key) {
  return minappVscode.schemes(key)
}

module.exports = {
  activate,
  deactivate,
  schemes,
}
