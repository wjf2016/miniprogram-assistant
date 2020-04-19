const vscode_1 = require('vscode')
const LinkProvider_1 = require('./plugin/LinkProvider')
const HoverProvider_1 = require('./plugin/HoverProvider')
const WxmlFormatter_1 = require('./plugin/WxmlFormatter')
const WxmlAutoCompletion_1 = require('./plugin/WxmlAutoCompletion')
const PugAutoCompletion_1 = require('./plugin/PugAutoCompletion')
const VueAutoCompletion_1 = require('./plugin/VueAutoCompletion')
const WxmlDocumentHighlight_1 = require('./plugin/WxmlDocumentHighlight')
const ActiveTextEditorListener_1 = require('./plugin/ActiveTextEditorListener')
const config_1 = require('./plugin/lib/config')
const PropDefinitionProvider_1 = require('./plugin/PropDefinitionProvider')

function activate(context) {
  console.log('minapp-vscode is now active!')
  config_1.configActivate()
  if (!config_1.config.disableAutoConfig) {
    autoConfig()
  }
  const formatter = new WxmlFormatter_1.default(config_1.config)
  const autoCompletionWxml = new WxmlAutoCompletion_1.default(config_1.config)
  const hoverProvider = new HoverProvider_1.default(config_1.config)
  const linkProvider = new LinkProvider_1.default(config_1.config)
  const autoCompletionPug = new PugAutoCompletion_1.default(config_1.config)
  const autoCompletionVue = new VueAutoCompletion_1.default(autoCompletionPug, autoCompletionWxml)
  const documentHighlight = new WxmlDocumentHighlight_1.default(config_1.config)
  const propDefinitionProvider = new PropDefinitionProvider_1.PropDefinitionProvider(config_1.config)
  const wxml = config_1.config.documentSelector.map(l => schemes(l))
  const pug = schemes('wxml-pug')
  const vue = schemes('vue')
  const enter = config_1.config.showSuggestionOnEnter ? ['\n'] : []
  context.subscriptions.push(
    // 给模板中的 脚本 添加特殊颜色
    new ActiveTextEditorListener_1.default(config_1.config),
    // hover 效果
    vscode_1.languages.registerHoverProvider([pug, vue].concat(wxml), hoverProvider),
    // 添加 link
    vscode_1.languages.registerDocumentLinkProvider([pug].concat(wxml), linkProvider),
    // 高亮匹配的标签
    vscode_1.languages.registerDocumentHighlightProvider(wxml, documentHighlight),
    // 格式化
    // vscode_1.languages.registerDocumentFormattingEditProvider(wxml, formatter),
    // vscode_1.languages.registerDocumentRangeFormattingEditProvider(wxml, formatter),
    // DefinitionProvider
    vscode_1.languages.registerDefinitionProvider([pug].concat(wxml), propDefinitionProvider),
    // 自动补全
    vscode_1.languages.registerCompletionItemProvider(
      wxml,
      autoCompletionWxml,
      '<',
      ' ',
      ':',
      '@',
      '.',
      '-',
      '"',
      "'",
      '/',
      ...enter
    ),
    vscode_1.languages.registerCompletionItemProvider(
      pug,
      autoCompletionPug,
      '\n',
      ' ',
      '(',
      ':',
      '@',
      '.',
      '-',
      '"',
      "'"
    ),
    // trigger 需要是上两者的和
    vscode_1.languages.registerCompletionItemProvider(
      vue,
      autoCompletionVue,
      '<',
      ' ',
      ':',
      '@',
      '.',
      '-',
      '(',
      '"',
      "'"
    )
  )
}

function deactivate() {
  config_1.configDeactivate()
}

function autoConfig() {
  let c = vscode_1.workspace.getConfiguration()
  const updates = [
    {
      key: 'files.associations',
      map: {
        '*.cjson': 'jsonc',
        '*.wxss': 'css',
        '*.wxs': 'javascript',
      },
    },
    {
      key: 'emmet.includeLanguages',
      map: {
        wxml: 'html',
      },
    },
  ]
  updates.forEach(({ key, map }) => {
    let oldMap = c.get(key, {})
    let appendMap = {}
    Object.keys(map).forEach(k => {
      if (!oldMap.hasOwnProperty(k)) appendMap[k] = map[k]
    })
    if (Object.keys(appendMap).length) {
      c.update(key, Object.assign({}, oldMap, appendMap), true)
    }
  })
  c.update('minapp-vscode.disableAutoConfig', true, true)
}

function schemes(key) {
  return { scheme: 'file', language: key }
}

module.exports = {
  activate,
  deactivate,
  schemes,
}
