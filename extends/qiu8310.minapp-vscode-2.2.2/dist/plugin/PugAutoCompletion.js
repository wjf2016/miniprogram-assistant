"use strict";
/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AutoCompletion_1 = require("./AutoCompletion");
const helper_1 = require("./lib/helper");
exports.LINE_TAG_REGEXP = /^[\w-:.]+(?:(?:[\.#][\w-])*)\(/;
class default_1 extends AutoCompletion_1.default {
    constructor() {
        super(...arguments);
        this.id = 'wxml-pug';
    }
    provideCompletionItems(document, position, token, context) {
        let items = [];
        let language = helper_1.getLanguage(document, position);
        if (!language)
            return items;
        let lineNum = position.line;
        let line = document.lineAt(lineNum).text.substr(0, position.character);
        if (/^\s*(\w*)$/.test(line)) {
            let prefix = RegExp.$1;
            let lastLine = this.getLastContentLine(document, lineNum);
            if (lastLine) {
                if (exports.LINE_TAG_REGEXP.test(lastLine)) {
                    // 上一行是标签，属性自动补全
                    if (!lastLine.includes(')'))
                        return this.createComponentAttributeSnippetItems(language, document, position);
                }
                else if (/^(@?[\w:-]+)=/.test(lastLine)) {
                    // 上一行也是属性的声明，此时也应该是属性自动补全
                    return this.createComponentAttributeSnippetItems(language, document, position);
                }
            }
            if (line.trim()) {
                return this.createComponentSnippetItems(language, document, position, prefix);
            }
        }
        let char = context.triggerCharacter || helper_1.getLastChar(document, position);
        switch (char) {
            case '"':
            case "'":
            case '(':
            case ' ':
                return this.createComponentAttributeSnippetItems(language, document, position);
            case ':': // 绑定变量 （也可以是原生小程序的控制语句或事件，如 wx:for, bind:tap）
            case '@': // 绑定事件
            case '-': // v-if
            case '.': // 变量或事件的修饰符
                return this.createSpecialAttributeSnippetItems(language, document, position);
        }
        return items;
    }
    createComponentAttributeSnippetItems(lc, doc, pos) {
        const _super = Object.create(null, {
            createComponentAttributeSnippetItems: { get: () => super.createComponentAttributeSnippetItems }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return this.wrapAttrItems(yield _super.createComponentAttributeSnippetItems.call(this, lc, doc, pos), doc, pos);
        });
    }
    createSpecialAttributeSnippetItems(lc, doc, pos) {
        const _super = Object.create(null, {
            createSpecialAttributeSnippetItems: { get: () => super.createSpecialAttributeSnippetItems }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return this.wrapAttrItems(yield _super.createSpecialAttributeSnippetItems.call(this, lc, doc, pos), doc, pos);
        });
    }
    wrapAttrItems(items, doc, pos) {
        let range = this.shouldNearLeftBracket(doc, pos);
        if (range) {
            items.forEach(it => (it.range = range));
        }
        return items;
    }
    shouldNearLeftBracket(document, pos) {
        let line = document.lineAt(pos.line).text;
        let range = document.getWordRangeAtPosition(pos, /\s+/);
        if (range && range.start.character > 0 && line[range.start.character - 1] === '(')
            return range;
        return;
    }
    /**
     * 获取上一行带内容的行
     */
    getLastContentLine(document, start) {
        while (--start >= 0) {
            let text = document.lineAt(start).text.trim();
            if (text)
                return text;
        }
        return;
    }
}
exports.default = default_1;
//# sourceMappingURL=PugAutoCompletion.js.map