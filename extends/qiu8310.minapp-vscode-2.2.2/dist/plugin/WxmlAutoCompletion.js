"use strict";
/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const AutoCompletion_1 = require("./AutoCompletion");
const helper_1 = require("./lib/helper");
class default_1 extends AutoCompletion_1.default {
    constructor() {
        super(...arguments);
        this.id = 'wxml';
    }
    provideCompletionItems(document, position, token, context) {
        if (token.isCancellationRequested) {
            return Promise.resolve([]);
        }
        let language = helper_1.getLanguage(document, position);
        if (!language)
            return [];
        let char = context.triggerCharacter || helper_1.getLastChar(document, position);
        switch (char) {
            case '<':
                return this.createComponentSnippetItems(language, document, position);
            case '\n': // 换行
            /// @ts-ignore
            case ' ': // 空格
                // 如果后面紧跟字母数字或_不触发自动提示
                // (常用于手动调整缩进位置)
                if (/[\w\d\$_]/.test(helper_1.getLastChar(document, new vscode_1.Position(position.line, position.character + 1)))) {
                    return Promise.resolve([]);
                }
            case '"':
            case "'":
                return this.createComponentAttributeSnippetItems(language, document, position);
            case ':': // 绑定变量 （也可以是原生小程序的控制语句或事件，如 wx:for, bind:tap）
            case '@': // 绑定事件
            case '-': // v-if
            case '.': // 变量或事件的修饰符
                return this.createSpecialAttributeSnippetItems(language, document, position);
            case '/': // 闭合标签
                return this.createCloseTagCompletionItem(document, position);
            default:
                if (char >= 'a' && char <= 'z') {
                    // 输入属性时自动提示
                    return this.createComponentAttributeSnippetItems(language, document, position);
                }
                return [];
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=WxmlAutoCompletion.js.map