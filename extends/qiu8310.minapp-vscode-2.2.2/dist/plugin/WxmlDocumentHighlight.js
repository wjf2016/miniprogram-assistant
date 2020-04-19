"use strict";
// tslint:disable:no-conditional-assignment
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const TagRegexp = /<([\w:-]+)|<\/([\w:-]+)>/g;
class WxmlDocumentHighlight {
    constructor(config) {
        this.config = config;
    }
    provideDocumentHighlights(doc, pos, token) {
        let range = doc.getWordRangeAtPosition(pos, /[\w:-]+/);
        if (!range)
            return [];
        let content = doc.getText();
        let name = doc.getText(range);
        let res = [range];
        if (prev(doc, range.start) === '<') {
            // start tag
            let nextStartIndex = doc.offsetAt(range.end);
            let nextText = this.normalize(content.slice(nextStartIndex));
            if (!/^[^<>]*\/>/.test(nextText)) {
                // not self close tag
                let nextEndIndex = this.findMatchedEndTag(name, nextText);
                if (typeof nextEndIndex === 'number') {
                    res.push(new vscode_1.Range(doc.positionAt(nextStartIndex + nextEndIndex + 2), doc.positionAt(nextStartIndex + nextEndIndex + 2 + name.length)));
                }
            }
        }
        else if (prev(doc, range.start, 2) === '</' && next(doc, range.end, 1) === '>') {
            // end tag
            let prevEndIndex = doc.offsetAt(range.start) - 2;
            let prevText = this.normalize(content.slice(0, prevEndIndex));
            let prevStartIndex = this.findMatchedStartTag(name, prevText);
            if (typeof prevStartIndex === 'number') {
                res.push(new vscode_1.Range(doc.positionAt(prevStartIndex + 1), doc.positionAt(prevStartIndex + 1 + name.length)));
            }
        }
        return res.map(r => new vscode_1.DocumentHighlight(r));
    }
    /**
     * 因为只需要 tag，所以这里把所有的注释属性替换成特殊字符
     */
    normalize(content) {
        let replacer = (raw) => new Array(raw.length).fill(' ').join('');
        return (content
            .replace(/<!--.*?-->/g, replacer) // 去除注释
            .replace(/("[^"]*"|'[^']*')/g, replacer) // 去除属性
            // .replace(/>[\s\S]*?</g, (raw) => '>' + replacer(raw.substr(2)) + '<') // 去除标签内容
            .replace(/<[\w:-]+\s+[^<>]*\/>/g, replacer)); // 去除自闭合的标签
    }
    findMatchedEndTag(name, nextContent) {
        TagRegexp.lastIndex = 0;
        let mat;
        let stack = [];
        while ((mat = TagRegexp.exec(nextContent))) {
            let [, startName, endName] = mat;
            if (startName) {
                stack.push(startName);
            }
            else if (endName) {
                let last = stack.pop();
                if (!last) {
                    // 最后一个了
                    if (endName === name) {
                        return mat.index;
                    }
                }
                else if (last !== endName) {
                    // wxml 解析错误
                    break;
                }
            }
        }
        return;
    }
    findMatchedStartTag(name, prevContent) {
        TagRegexp.lastIndex = 0;
        let mat;
        let stack = [];
        while ((mat = TagRegexp.exec(prevContent))) {
            let [, startName, endName] = mat;
            if (startName) {
                stack.push([startName, mat.index]);
            }
            else if (endName) {
                let last = stack.pop();
                if (!last) {
                    break;
                }
                else if (last[0] !== endName) {
                    // wxml 解析错误
                    break;
                }
            }
        }
        let l = stack[stack.length - 1];
        return l ? l[1] : undefined;
    }
}
exports.default = WxmlDocumentHighlight;
function next(doc, pos, length = 1) {
    let start = new vscode_1.Position(pos.line, pos.character);
    let end = new vscode_1.Position(pos.line, pos.character + length);
    return doc.getText(new vscode_1.Range(start, end));
}
function prev(doc, pos, length = 1) {
    let start = new vscode_1.Position(pos.line, pos.character - length);
    let end = new vscode_1.Position(pos.line, pos.character);
    return doc.getText(new vscode_1.Range(start, end));
}
//# sourceMappingURL=WxmlDocumentHighlight.js.map