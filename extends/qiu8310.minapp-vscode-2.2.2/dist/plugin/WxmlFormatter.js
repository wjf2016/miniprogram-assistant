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
const wxml_parser_1 = require("@minapp/wxml-parser");
const helper_1 = require("./lib/helper");
const requirePackage_1 = require("./lib/requirePackage");
class default_1 {
    constructor(config) {
        this.config = config;
    }
    format(doc, range, options, prefix = '') {
        return __awaiter(this, void 0, void 0, function* () {
            let code = doc.getText(range);
            let content = code;
            const resolveOptions = (prettier) => (prettier || requirePackage_1.requireLocalPkg(doc.uri.fsPath, 'prettier')).resolveConfig(doc.uri.fsPath, {
                editorconfig: true,
            });
            try {
                if (this.config.wxmlFormatter === 'prettier') {
                    const prettier = requirePackage_1.requireLocalPkg(doc.uri.fsPath, 'prettier');
                    let prettierOptions = yield resolveOptions(prettier);
                    content = prettier.format(code, Object.assign({}, this.config.prettier, prettierOptions));
                }
                else if (this.config.wxmlFormatter === 'prettyHtml') {
                    let prettyHtmlOptions = this.config.prettyHtml;
                    if (prettyHtmlOptions.usePrettier) {
                        const prettierOptions = yield resolveOptions();
                        prettyHtmlOptions = Object.assign({}, prettyHtmlOptions, prettierOptions, { prettier: prettierOptions });
                    }
                    /**
                     * prettyHtml 会将 `<input />` 转化成 `<input>`，而
                     * https://github.com/prettyhtml/pretty-html-web 中的版本
                     * 不会，所以将它仓库中的版本生成的 js 移到了此处
                     */
                    content = require('../../res/prettyhtml.js')(code, prettyHtmlOptions).contents;
                }
                else {
                    content = wxml_parser_1.parse(code).toXML({
                        prefix,
                        eol: helper_1.getEOL(doc),
                        preferSpaces: options.insertSpaces,
                        tabSize: options.tabSize,
                        maxLineCharacters: this.config.formatMaxLineCharacters,
                        removeComment: false,
                        reserveTags: this.config.reserveTags,
                    });
                }
            }
            catch (e) {
                vscode_1.window.showErrorMessage(`${this.config.wxmlFormatter} format error: ` + e.message);
            }
            return [new vscode_1.TextEdit(range, content)];
        });
    }
    provideDocumentFormattingEdits(doc, options) {
        let range = new vscode_1.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end);
        return this.format(doc, range, options);
    }
    provideDocumentRangeFormattingEdits(doc, range, options) {
        let prefixRange = doc.getWordRangeAtPosition(range.start, /[ \t]+/);
        let prefix = prefixRange ? doc.getText(prefixRange) : '';
        return this.format(doc, range, options, prefix);
    }
}
exports.default = default_1;
//# sourceMappingURL=WxmlFormatter.js.map