"use strict";
/******************************************************************
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
let listener;
exports.config = {
    formatMaxLineCharacters: 100,
    disableCustomComponentAutocomponent: false,
    showSuggestionOnEnter: false,
    resolveRoots: [],
    getResolveRoots,
    linkAttributeNames: [],
    disableDecorate: false,
    decorateComplexInterpolation: true,
    decorateType: {},
    snippets: {},
    selfCloseTags: [],
    disableAutoConfig: false,
    wxmlQuoteStyle: '"',
    pugQuoteStyle: "'",
    reserveTags: [],
    globalStyleFiles: [],
    styleExtensions: [],
    wxmlFormatter: 'wxml',
    prettyHtml: {},
    prettier: {},
    documentSelector: ['wxml'],
    sass: {},
};
function getConfig() {
    const minapp = vscode.workspace.getConfiguration('minapp-vscode');
    exports.config.disableCustomComponentAutocomponent = minapp.get('disableCustomComponentAutocomponent', false);
    exports.config.showSuggestionOnEnter = minapp.get('showSuggestionOnEnter', false);
    exports.config.resolveRoots = minapp.get('resolveRoots', ['src', 'node_modules']);
    exports.config.linkAttributeNames = minapp.get('linkAttributeNames', ['src']);
    exports.config.formatMaxLineCharacters = minapp.get('formatMaxLineCharacters', 100);
    exports.config.disableDecorate = minapp.get('disableDecorate', true);
    exports.config.decorateComplexInterpolation = minapp.get('decorateComplexInterpolation', true);
    exports.config.decorateType = minapp.get('decorateType', {});
    exports.config.snippets = minapp.get('snippets', {});
    exports.config.selfCloseTags = minapp.get('selfCloseTags', []);
    exports.config.disableAutoConfig = minapp.get('disableAutoConfig', false);
    exports.config.wxmlQuoteStyle = minapp.get('wxmlQuoteStyle', '"');
    exports.config.pugQuoteStyle = minapp.get('pugQuoteStyle', "'");
    exports.config.reserveTags = minapp.get('reserveTags', []);
    exports.config.globalStyleFiles = minapp.get('globalStyleFiles', []);
    exports.config.styleExtensions = minapp.get('styleExtensions', []);
    exports.config.wxmlFormatter = minapp.get('wxmlFormatter', 'wxml');
    exports.config.prettyHtml = minapp.get('prettyHtml', {});
    exports.config.prettier = minapp.get('prettier', {});
    exports.config.documentSelector = minapp.get('documentSelector', ['wxml']);
    exports.config.sass = minapp.get('sass', {});
}
function getResolveRoots(doc) {
    let root = vscode.workspace.getWorkspaceFolder(doc.uri);
    return root ? exports.config.resolveRoots.map(r => path.resolve(root.uri.fsPath, r)) : [];
}
function configActivate() {
    listener = vscode.workspace.onDidChangeConfiguration(getConfig);
    getConfig();
}
exports.configActivate = configActivate;
function configDeactivate() {
    listener.dispose();
}
exports.configDeactivate = configDeactivate;
//# sourceMappingURL=config.js.map