"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("../lib/helper");
const getPugTag_1 = require("./getPugTag");
const getWxmlTag_1 = require("./getWxmlTag");
function getVueTag(doc, pos) {
    let lang = doc.languageId;
    if (lang === 'vue') {
        lang = helper_1.getLangForVue(doc, pos);
        if (!lang)
            return null;
    }
    if (lang.includes('pug'))
        return getPugTag_1.getPugTag(doc, pos);
    if ('wxml' === lang)
        return getWxmlTag_1.getWxmlTag(doc, pos);
    return null;
}
exports.getVueTag = getVueTag;
//# sourceMappingURL=getVueTag.js.map