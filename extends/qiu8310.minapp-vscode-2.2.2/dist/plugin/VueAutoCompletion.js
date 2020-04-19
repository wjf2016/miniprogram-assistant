"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./lib/helper");
class default_1 {
    constructor(pug, wxml) {
        this.pug = pug;
        this.wxml = wxml;
    }
    provideCompletionItems(document, position, token, context) {
        let lang = helper_1.getLangForVue(document, position);
        if (lang === 'pug') {
            return this.pug.provideCompletionItems(document, position, token, context);
        }
        else if (lang && /mpvue|wxml/.test(lang)) {
            return this.wxml.provideCompletionItems(document, position, token, context);
        }
        return [];
    }
}
exports.default = default_1;
//# sourceMappingURL=VueAutoCompletion.js.map