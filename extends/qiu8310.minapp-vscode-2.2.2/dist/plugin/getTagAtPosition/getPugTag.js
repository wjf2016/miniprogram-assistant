"use strict";
/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc^126.com> (https://github.com/qiu8310)
*******************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const SINGLE_LINE_TAG_REGEXP = /^(\s*)([\w-:.]+)((?:[\.#][\w-])*)(\s*\()(.*)\)/;
const MULTIPLE_LINE_TAG_REGEXP = /^(\s*)([\w-:.]+)((?:[\.#][\w-])*)(\s*\()/;
let replacer = (char) => (raw) => char.repeat(raw.length);
function getPugTag(doc, pos) {
    // 先处理单行的 pug 语法
    let line = doc.lineAt(pos.line).text;
    let index = pos.character;
    if (SINGLE_LINE_TAG_REGEXP.test(line)) {
        let prefix = RegExp.$1;
        let name = RegExp.$2;
        let classOrId = RegExp.$3;
        let rest = RegExp.$4;
        let attrstr = (RegExp.$5 || '').trim();
        if (index < prefix.length) {
            return null;
        }
        else if (index <= prefix.length + name.length) {
            return {
                name,
                attrs: base_1.getAttrs(attrstr),
                posWord: name,
                isOnTagName: true,
                isOnAttrName: false,
                isOnAttrValue: false,
                attrName: '',
            };
        }
        else if (index < prefix.length + name.length + classOrId.length + rest.length ||
            index > prefix.length + name.length + classOrId.length + rest.length + attrstr.length + 1 // 后面有半个括号
        ) {
            return null;
        }
        else {
            let { posWord, attrName, isOnAttrValue } = parseLine(line, doc, pos);
            return {
                name,
                attrs: base_1.getAttrs(attrstr),
                posWord,
                isOnTagName: false,
                isOnAttrName: !isOnAttrValue && !!posWord,
                isOnAttrValue,
                attrName,
            };
        }
    }
    else {
        // FIXME: 多行的时候也可以 hover 在 tagName 上（即 isOnTagName 可能为 true）
        // 向上查找 ( ，不能出现 )
        // 向下查找 ) ，不能出现（
        let startLine = pos.line;
        let attrs = {};
        let name = searchUp(doc, startLine, attrs);
        if (!name)
            return null;
        if (!searchDown(doc, startLine + 1, attrs))
            return null;
        let { posWord, attrName, isOnAttrValue } = parseLine(doc.lineAt(startLine).text, doc, pos);
        return {
            name,
            attrs,
            posWord,
            isOnTagName: false,
            isOnAttrName: !isOnAttrValue && !!posWord,
            isOnAttrValue,
            attrName,
        };
    }
}
exports.getPugTag = getPugTag;
function parseLine(line, doc, pos) {
    // 因为双大括号里可能会有任何字符，估优先处理
    // 用特殊字符替换 "{{" 与 "}}" 和 "{" 与 "}" 之间的语句，并保证字符数一致
    line = line.replace(/\{\{[^\}]*?\}\}/g, replacer('^')).replace(/\{[^\}]*?\}/g, replacer('^')); // a(style={color: 'red', background: 'green'}) => a(style=^^^^^^^^)
    let attrFlagLine = line.replace(/("[^"]*"|'[^']*')/g, replacer('%')); // 将引号中的内容也替换了
    let range = doc.getWordRangeAtPosition(pos, /\b[\w-:.]+\b/);
    let posWord = '';
    let attrName = '';
    if (range)
        posWord = doc.getText(range);
    let isOnAttrValue = attrFlagLine[pos.character] === '%';
    if (isOnAttrValue) {
        attrName = getAttrName(attrFlagLine.substring(0, pos.character));
    }
    return {
        posWord,
        attrName,
        isOnAttrValue,
    };
}
function searchUp(doc, lineNum, attrs) {
    while (lineNum >= 0) {
        let text = doc.lineAt(lineNum).text.trim();
        if (text) {
            if (text.startsWith('-'))
                return false;
            if (text.includes(')'))
                return false;
            if (text.indexOf('(') > 0 && MULTIPLE_LINE_TAG_REGEXP.test(text)) {
                let name = RegExp.$2;
                Object.assign(attrs, base_1.getAttrs((RegExp.$5 || '').trim()));
                return name;
            }
            let left = base_1.getAttrs2(text, attrs);
            if (left)
                return false;
        }
        lineNum--;
    }
    return false;
}
function searchDown(doc, lineNum, attrs) {
    while (lineNum < doc.lineCount) {
        let text = doc.lineAt(lineNum).text.trim();
        if (text) {
            if (text.startsWith('-'))
                return false;
            if (text.indexOf('(') > 0)
                return false;
            if (text.includes(')'))
                return true;
            let left = base_1.getAttrs2(text, attrs);
            if (left)
                return false;
        }
        lineNum++;
    }
    return false;
}
function getAttrName(str) {
    // 左边可以是括号（pug）或空格
    if (/(?:\(|\s)([\w-:.]+)=%*$/.test(str)) {
        return RegExp.$1;
    }
    return '';
}
//# sourceMappingURL=getPugTag.js.map