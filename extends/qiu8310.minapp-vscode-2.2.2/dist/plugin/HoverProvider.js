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
const vscode_1 = require("vscode");
const common_1 = require("@minapp/common");
const getTagAtPosition_1 = require("./getTagAtPosition/");
const helper_1 = require("./lib/helper");
class default_1 {
    constructor(config) {
        this.config = config;
    }
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let language = helper_1.getLanguage(document, position);
            if (!language)
                return null;
            let tag = getTagAtPosition_1.getTagAtPosition(document, position);
            if (!tag)
                return null;
            let co = helper_1.getCustomOptions(this.config, document);
            let markdown;
            if (tag.isOnTagName) {
                markdown = yield common_1.hoverComponentMarkdown(tag.name, language, co);
            }
            else if (!tag.isOnTagName && tag.posWord && !/^(wx|bind|catch):/.test(tag.posWord)) {
                markdown = yield common_1.hoverComponentAttrMarkdown(tag.name, tag.posWord, language, co);
            }
            return markdown ? new vscode_1.Hover(new vscode_1.MarkdownString(markdown)) : null;
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=HoverProvider.js.map