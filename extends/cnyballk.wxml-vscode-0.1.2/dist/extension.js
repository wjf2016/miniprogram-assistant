const vscode_1 = require('vscode')
const ActiveText_1 = require('./ActiveText')
const FormatWxml_1 = require('./FormatWxml')
const saveFormat_1 = require('./saveFormat')
const config_1 = require('./config')

function activate(context) {
  const wxml = new FormatWxml_1.default()
  config_1.getConfig()
  saveFormat_1.default(wxml)
  const activeText = new ActiveText_1.default(config_1.config)
  config_1.configActivate(activeText, () => {
    saveFormat_1.default(wxml)
  })
  context.subscriptions.push(activeText)
  vscode_1.commands.registerCommand('miniprogramAssistant.formatWxml', () => {
    wxml.init()
  })
}

function deactivate() {
  config_1.configDeactivate()
}

module.exports = {
  activate,
  deactivate,
}
