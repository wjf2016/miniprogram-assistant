"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const getTagAtPosition_1 = require("./getTagAtPosition");
const StyleFile_1 = require("./lib/StyleFile");
const ScriptFile_1 = require("./lib/ScriptFile");
const reserveWords = ['true', 'false'];
class PropDefinitionProvider {
    constructor(config) {
        this.config = config;
    }
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const tag = getTagAtPosition_1.getTagAtPosition(document, position);
            const locs = [];
            if (tag) {
                const { attrs, attrName, posWord } = tag;
                const rawAttrValue = (attrs['__' + attrName] || '').replace(/^['"]|['"]$/g, ''); // 去除引号
                // 不在属性上
                if (!tag.isOnAttrValue)
                    return locs;
                // 忽略特殊字符或者以数字开头的单词
                if (reserveWords.includes(posWord) || /^\d/.test(posWord))
                    return locs;
                if (attrName === 'class') {
                    return this.searchStyle(posWord, document, position);
                }
                else if (attrName.endsWith('.sync') || (rawAttrValue.startsWith('{{') && rawAttrValue.endsWith('}}'))) {
                    return this.searchScript('prop', posWord, document);
                }
                else if (/^(bind|catch)/.test(attrName) || /\.(user|stop|default)$/.test(attrName)) {
                    return this.searchScript('method', posWord, document);
                }
            }
            else {
                // 判断是否是在 {{ }} 中
                let range = document.getWordRangeAtPosition(position, /\{\{[\s\w]+\}\}/);
                if (!range)
                    return locs;
                let text = document.getText(range).replace(/^\{\{\s*|\s*\}\}$/g, '');
                return this.searchScript('prop', text, document);
            }
            return locs;
        });
    }
    searchScript(type, word, doc) {
        return ScriptFile_1.getProp(doc.fileName, type, word).map(p => p.loc);
    }
    searchStyle(className, document, position) {
        const locs = [];
        StyleFile_1.getClass(document, this.config).forEach(styfile => {
            styfile.styles.forEach(sty => {
                if (sty.name === className) {
                    let start = sty.pos;
                    let end = new vscode_1.Position(start.line, 1 + start.character + className.length);
                    locs.push(new vscode_1.Location(vscode_1.Uri.file(styfile.file), new vscode_1.Range(start, end)));
                }
            });
        });
        return locs;
    }
}
exports.PropDefinitionProvider = PropDefinitionProvider;
//# sourceMappingURL=PropDefinitionProvider.js.map