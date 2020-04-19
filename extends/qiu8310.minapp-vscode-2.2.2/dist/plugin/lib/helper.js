"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/******************************************************************
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
const vscode_1 = require("vscode");
const fs = require("fs");
const language_1 = require("./language");
const os_1 = require("os");
// <template lang="wxml/pug/wxml-pug" minapp="native/wepy/mpvue"> ；默认 minapp="mpvue"
const vueTemplateMinappStartTag = /^\s*<template\b[^>]*(?:minapp)=['"](\w+)['"][^>]*>/;
const vueTemplateLangStartTag = /^\s*<template\b[^>]*(?:x?lang)=['"]([\w-]+)['"][^>]*>/;
const vueTemplateEndTag = /<\/template>\s*$/;
function getLanguage(doc, pos) {
    let minapp;
    if (doc.languageId === 'wxml' || doc.languageId === 'wxml-pug') {
        minapp = 'native';
    }
    else {
        doc
            .getText()
            .split(/\r?\n/)
            .some((text, i) => {
            if (!minapp && vueTemplateMinappStartTag.test(text))
                minapp = RegExp.$1.replace(/['"]/g, '');
            if (i === pos.line)
                return true;
            if (minapp && vueTemplateEndTag.test(text))
                minapp = undefined;
            return false;
        });
        if (!minapp)
            minapp = 'mpvue';
    }
    return minapp && language_1.Languages[minapp] ? language_1.Languages[minapp] : undefined;
}
exports.getLanguage = getLanguage;
function getLangForVue(doc, pos) {
    let lang;
    doc
        .getText()
        .split(/\r?\n/)
        .some((text, i) => {
        if (!lang && vueTemplateLangStartTag.test(text))
            lang = RegExp.$1.replace(/['"]/g, '');
        if (i === pos.line)
            return true;
        if (lang && vueTemplateEndTag.test(text))
            lang = undefined;
        return false;
    });
    return lang;
}
exports.getLangForVue = getLangForVue;
function getCustomOptions(config, document) {
    return config.disableCustomComponentAutocomponent || document.languageId !== 'wxml'
        ? undefined
        : { filename: document.fileName, resolves: config.getResolveRoots(document) };
}
exports.getCustomOptions = getCustomOptions;
function getTextAtPosition(doc, pos, charRegExp) {
    let line = doc.lineAt(pos.line).text;
    let mid = pos.character - 1;
    if (!charRegExp.test(line[mid]))
        return;
    let str = line[mid];
    let i = mid;
    while (++i < line.length) {
        if (charRegExp.test(line[i]))
            str += line[i];
        else
            break;
    }
    i = mid;
    while (--i >= 0) {
        if (charRegExp.test(line[i]))
            str = line[i] + str;
        else
            break;
    }
    return str;
}
exports.getTextAtPosition = getTextAtPosition;
function getLastChar(doc, pos) {
    return doc.getText(new vscode_1.Range(new vscode_1.Position(pos.line, pos.character - 1), pos));
}
exports.getLastChar = getLastChar;
/**
 * 获取 vscode 编辑器打开的文件的内容
 *
 * 不要直接使用 fs 去读取文件内容，因为在编辑器中文件可能并没有保存到本地，也就是说 fs 拿到的可能不是最新的内容
 */
function getFileContent(file) {
    let editor = vscode_1.window.visibleTextEditors.find(e => e.document.fileName === file);
    return editor ? editor.document.getText() : fs.readFileSync(file).toString();
}
exports.getFileContent = getFileContent;
/** 全局匹配 */
function match(content, regexp) {
    let mat;
    let res = [];
    // tslint:disable:no-conditional-assignment
    while ((mat = regexp.exec(content)))
        res.push(mat);
    return res;
}
exports.match = match;
/** 获取根目录 */
function getRoot(doc) {
    let wf = vscode_1.workspace.getWorkspaceFolder(doc.uri);
    if (!wf)
        return;
    return wf.uri.fsPath;
}
exports.getRoot = getRoot;
/** 根据文件内容和位置，获取 vscode 的 Position 对象 */
function getPositionFromIndex(content, index) {
    let text = content.substring(0, index);
    let lines = text.split(/\r?\n/);
    let line = lines.length - 1;
    return new vscode_1.Position(line, lines[line].length);
}
exports.getPositionFromIndex = getPositionFromIndex;
function getEOL(doc) {
    const eol = vscode_1.workspace.getConfiguration('files', doc.uri).get('eol', os_1.EOL);
    // vscode 更新导致获取的配置换行符可能为 "auto"，参见：https://github.com/wx-minapp/minapp-vscode/issues/6
    return !['\n', '\r\n', '\r'].includes(eol) ? os_1.EOL : eol;
}
exports.getEOL = getEOL;
//# sourceMappingURL=helper.js.map