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
const path = require("path");
const helper_1 = require("./lib/helper");
const getTagAtPosition_1 = require("./getTagAtPosition/");
const s = require("./res/snippets");
const StyleFile_1 = require("./lib/StyleFile");
const closeTag_1 = require("./lib/closeTag");
const ScriptFile_1 = require("./lib/ScriptFile");
class AutoCompletion {
    constructor(config) {
        this.config = config;
    }
    get isPug() {
        return this.id === 'wxml-pug';
    }
    get attrQuote() {
        return this.isPug ? this.config.pugQuoteStyle : this.config.wxmlQuoteStyle;
    }
    getCustomOptions(doc) {
        return helper_1.getCustomOptions(this.config, doc);
    }
    renderTag(tag, sortText) {
        let c = tag.component;
        let item = new vscode_1.CompletionItem(c.name, vscode_1.CompletionItemKind.Module);
        let { attrQuote, isPug } = this;
        let allAttrs = c.attrs || [];
        let attrs = allAttrs
            .filter(a => a.required || a.subAttrs)
            .map((a, i) => (isPug ? '' : ' ') + `${a.name}=${attrQuote}${this.setDefault(i + 1, a.defaultValue)}${attrQuote}`);
        let extraSpace = '';
        // 如果自动补全中没有属性，并且此组件有额外属性，则触发自动属性补全
        if (!attrs.length && allAttrs.length) {
            item.command = autoSuggestCommand();
            extraSpace = ' ';
        }
        let len = attrs.length + 1;
        let snippet;
        if (isPug) {
            snippet = `${c.name}(${attrs.join(' ')}\${${len}})\${0}`;
        }
        else {
            if (this.config.selfCloseTags.includes(c.name)) {
                snippet = `${c.name}${attrs.join('')}${extraSpace}\${${len}} />\${0}`;
            }
            else {
                snippet = `${c.name}${attrs.join('')}${extraSpace}\${${len}}>\${${len + 1}}</${c.name}>\${0}`;
            }
        }
        item.insertText = new vscode_1.SnippetString(snippet);
        item.documentation = new vscode_1.MarkdownString(tag.markdown);
        item.sortText = sortText;
        return item;
    }
    renderTagAttr(tagAttr, sortText, kind) {
        let a = tagAttr.attr;
        let item = new vscode_1.CompletionItem(a.name, kind === undefined ? vscode_1.CompletionItemKind.Field : kind);
        let defaultValue = a.defaultValue;
        if (!this.isDefaultValueValid(defaultValue)) {
            defaultValue = a.enum && a.enum[0].value;
        }
        let { attrQuote, isPug } = this;
        if (a.boolean) {
            item.insertText = new vscode_1.SnippetString(isPug && defaultValue === 'false' ? `${a.name}=false` : a.name);
        }
        else {
            let value = a.addBrace ? '{{${1}}}' : this.setDefault(1, defaultValue);
            // 是否有可选值，如果有可选值则触发命令的自动补全
            let values = a.enum ? a.enum : a.subAttrs ? a.subAttrs.map(sa => ({ value: sa.equal })) : [];
            if (values.length) {
                value = '${1}';
                item.command = autoSuggestCommand();
            }
            item.insertText = new vscode_1.SnippetString(`${a.name}=${attrQuote}${value}${attrQuote}$0`);
        }
        item.documentation = new vscode_1.MarkdownString(tagAttr.markdown);
        item.sortText = sortText;
        if (a.name === 'class')
            item.command = autoSuggestCommand();
        return item;
    }
    renderSnippet(doc, name, snippet, sortText) {
        let item = new vscode_1.CompletionItem(name + ' snippet', vscode_1.CompletionItemKind.Snippet);
        let eol = helper_1.getEOL(doc);
        let body = Array.isArray(snippet.body) ? snippet.body.join(eol) : snippet.body;
        body = body.replace(/___/g, this.attrQuote);
        if (!this.isPug && body.startsWith('<'))
            body = body.substr(1); // 去除触发符号
        item.insertText = new vscode_1.SnippetString(body);
        item.documentation = new vscode_1.MarkdownString(snippet.markdown || snippet.description);
        item.sortText = sortText;
        return item;
    }
    setDefault(index, defaultValue) {
        if (!this.isDefaultValueValid(defaultValue))
            return '${' + index + '}';
        if (typeof defaultValue === 'boolean' || defaultValue === 'true' || defaultValue === 'false') {
            return `{{\${${index}|true,false|}}}`;
        }
        else {
            return `\${${index}:${String(defaultValue).replace(/['"]/g, '')}}`;
        }
    }
    isDefaultValueValid(defaultValue) {
        return defaultValue !== undefined && defaultValue !== '';
    }
    /**
     * 创建组件名称的自动补全
     */
    createComponentSnippetItems(lc, doc, pos, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield common_1.autocompleteTagName(lc, this.getCustomOptions(doc));
            let filter = (key) => key && (!prefix || prefix.split('').every(c => key.includes(c)));
            let filterComponent = (t) => filter(t.component.name);
            let items = [
                ...res.customs.filter(filterComponent).map(t => this.renderTag(t, 'a')),
                ...res.natives.filter(filterComponent).map(t => this.renderTag(t, 'c')),
            ];
            // 添加 Snippet
            let userSnippets = this.config.snippets;
            let allSnippets = this.isPug
                ? Object.assign({}, s.PugSnippets, userSnippets.pug) : Object.assign({}, s.WxmlSnippets, userSnippets.wxml);
            items.push(...Object.keys(allSnippets)
                .filter(k => filter(k))
                .map(k => {
                let snippet = allSnippets[k];
                if (!snippet.description) {
                    let ck = k.split(' ')[0]; // 取出名称中的第一段即可
                    let found = res.natives.find(it => it.component.name === (ck || k));
                    if (found)
                        snippet.markdown = found.markdown;
                }
                return this.renderSnippet(doc, k, allSnippets[k], 'b');
            }));
            if (prefix) {
                items.forEach(it => {
                    it.range = new vscode_1.Range(new vscode_1.Position(pos.line, pos.character - prefix.length), pos);
                });
            }
            return items;
        });
    }
    /**
     * 创建组件属性的自动补全
     */
    createComponentAttributeSnippetItems(lc, doc, pos) {
        return __awaiter(this, void 0, void 0, function* () {
            let tag = getTagAtPosition_1.getTagAtPosition(doc, pos);
            if (!tag)
                return [];
            if (tag.isOnTagName) {
                return this.createComponentSnippetItems(lc, doc, pos, tag.name);
            }
            if (tag.isOnAttrValue && tag.attrName) {
                let attrValue = tag.attrs[tag.attrName];
                if (tag.attrName === 'class' || /^[\w\d-]+-class/.test(tag.attrName)) {
                    // `class` 或者 `xxx-class` 自动提示 class 名
                    let existsClass = (tag.attrs[tag.attrName] || '');
                    return this.autoCompleteClassNames(doc, existsClass ? existsClass.trim().split(/\s+/) : []);
                }
                else if (typeof attrValue === 'string') {
                    if (tag.attrName.startsWith('bind') || tag.attrName.startsWith('catch')) {
                        // 函数自动补全
                        return this.autoCompleteMethods(doc, attrValue.replace(/"|'/, ''));
                    }
                    else if (attrValue.trim() === '') {
                        let values = yield common_1.autocompleteTagAttrValue(tag.name, tag.attrName, lc, this.getCustomOptions(doc));
                        if (!values.length)
                            return [];
                        let range = doc.getWordRangeAtPosition(pos, /['"]\s*['"]/);
                        if (range) {
                            range = new vscode_1.Range(new vscode_1.Position(range.start.line, range.start.character + 1), new vscode_1.Position(range.end.line, range.end.character - 1));
                        }
                        return values.map(v => {
                            let it = new vscode_1.CompletionItem(v.value, vscode_1.CompletionItemKind.Value);
                            it.documentation = new vscode_1.MarkdownString(v.markdown);
                            it.range = range;
                            return it;
                        });
                    }
                    // } else if ((tag.attrName.startsWith('bind') || tag.attrName.startsWith('catch')) && typeof attrValue === 'string') {
                    //   return this.autoCompleteMethods(doc, attrValue.replace(/"|'/, ''))
                }
                return [];
            }
            else {
                let res = yield common_1.autocompleteTagAttr(tag.name, tag.attrs, lc, this.getCustomOptions(doc));
                let triggers = [];
                let { natives, basics } = res;
                let noBasics = lc.noBasicAttrsComponents || [];
                if (!noBasics.includes(tag.name)) {
                    triggers = [...Object.keys(lc.custom), ...lc.event.prefixes]
                        .filter(k => k.length > 1)
                        .map(k => {
                        // let str = k.substr(0, k.length - 1)
                        // let trigger = k[k.length - 1]
                        // let item = new CompletionItem(str, CompletionItemKind.Constant)
                        let item = new vscode_1.CompletionItem(k, vscode_1.CompletionItemKind.Constant);
                        item.sortText = 'z';
                        item.command = autoSuggestCommand();
                        // item.documentation = new MarkdownString(`输入此字段再输入 "**${trigger}**" 字符可以再次触发自动补全`)
                        return item;
                    });
                }
                return [
                    ...natives.map(a => this.renderTagAttr(a, 'a')),
                    ...basics.map(a => this.renderTagAttr(a, 'b')),
                    ...triggers,
                ];
            }
        });
    }
    /**
     * wxml:
     *    wx:
     *    bind:
     *    catch:
     *
     * vue:
     *    :
     *    @
     *    :xxx.sync
     *    @xxx.default, @xxx.user, @xxx.stop
     */
    createSpecialAttributeSnippetItems(lc, doc, pos) {
        return __awaiter(this, void 0, void 0, function* () {
            let prefix = helper_1.getTextAtPosition(doc, pos, /[:@\w\d\.-]/);
            if (!prefix)
                return [];
            let tag = getTagAtPosition_1.getTagAtPosition(doc, pos);
            if (!tag)
                return [];
            let isEventPrefix = lc.event.prefixes.includes(prefix);
            // 非 Event，也非其它自定义的属性
            if (!isEventPrefix && !lc.custom.hasOwnProperty(prefix)) {
                // modifiers
                let modifiers = [];
                if (prefix.endsWith('.')) {
                    if (lc.event.prefixes.some(p => prefix.startsWith(p))) {
                        modifiers = lc.event.modifiers;
                    }
                    else {
                        let customPrefix = Object.keys(lc.custom).find(p => prefix.startsWith(p));
                        if (customPrefix)
                            modifiers = lc.custom[customPrefix].modifiers;
                    }
                }
                return modifiers.map(m => new vscode_1.CompletionItem(m, vscode_1.CompletionItemKind.Constant));
            }
            let res = yield common_1.autocompleteSpecialTagAttr(prefix, tag.name, tag.attrs, lc, this.getCustomOptions(doc));
            let kind = isEventPrefix ? vscode_1.CompletionItemKind.Event : vscode_1.CompletionItemKind.Field;
            return [
                ...res.customs.map(c => this.renderTagAttr(c, 'a', kind)),
                ...res.natives.map(c => this.renderTagAttr(c, 'b', kind)),
            ];
        });
    }
    // 样式名自动补全
    autoCompleteClassNames(doc, existsClassNames) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = [];
            let stylefiles = StyleFile_1.getClass(doc, this.config);
            let root = helper_1.getRoot(doc);
            stylefiles.forEach((stylefile, sfi) => {
                stylefile.styles.forEach(sty => {
                    if (!existsClassNames.includes(sty.name)) {
                        existsClassNames.push(sty.name);
                        let i = new vscode_1.CompletionItem(sty.name);
                        i.kind = vscode_1.CompletionItemKind.Variable;
                        i.detail = root ? path.relative(root, stylefile.file) : path.basename(stylefile.file);
                        i.sortText = 'style' + sfi;
                        i.documentation = new vscode_1.MarkdownString(sty.doc);
                        items.push(i);
                    }
                });
            });
            return items;
        });
    }
    /**
     * 闭合标签自动完成
     * @param doc
     * @param pos
     */
    createCloseTagCompletionItem(doc, pos) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = doc.getText(new vscode_1.Range(new vscode_1.Position(0, 0), pos));
            if (text.length < 2 || text.substr(text.length - 2) !== '</') {
                return [];
            }
            const closeTag = closeTag_1.getCloseTag(text);
            if (closeTag) {
                const completionItem = new vscode_1.CompletionItem(closeTag);
                completionItem.kind = vscode_1.CompletionItemKind.Property;
                completionItem.insertText = closeTag;
                const nextPos = new vscode_1.Position(pos.line, pos.character + 1);
                if (helper_1.getLastChar(doc, nextPos) === '>') {
                    completionItem.range = new vscode_1.Range(pos, nextPos);
                    completionItem.label = closeTag.substr(0, closeTag.length - 1);
                }
                return [completionItem];
            }
            return [];
        });
    }
    /**
     * 函数自动提示
     * @param doc
     * @param prefix 函数前缀,空则查找所有函数
     */
    autoCompleteMethods(doc, prefix) {
        /**
         * 页面周期和组件 生命周期函数,
         * 显示时置于最后
         * 列表中顺序决定显示顺序
         */
        const lowPriority = [
            'onPullDownRefresh',
            'onReachBottom',
            'onPageScroll',
            'onShow',
            'onHide',
            'onTabItemTap',
            'onLoad',
            'onReady',
            'onResize',
            'onUnload',
            'onShareAppMessage',
            'error',
            'creaeted',
            'attached',
            'ready',
            'moved',
            'detached',
            'observer',
        ];
        const methods = ScriptFile_1.getProp(doc.uri.fsPath, 'method', (prefix || '[\\w_$]') + '[\\w\\d_$]*');
        const root = helper_1.getRoot(doc);
        return methods.map(l => {
            const c = new vscode_1.CompletionItem(l.name, getMethodKind(l.detail));
            const filePath = root ? path.relative(root, l.loc.uri.fsPath) : path.basename(l.loc.uri.fsPath);
            // 低优先级排序滞后
            const priotity = lowPriority.indexOf(l.name) + 1;
            c.detail = `${filePath}\n[${l.loc.range.start.line}行,${l.loc.range.start.character}列]`;
            c.documentation = new vscode_1.MarkdownString('```ts\n' + l.detail + '\n```');
            /**
             * 排序显示规则
             * 1. 正常函数 如 `onTap`
             * 2. 下划线函数 `_save`
             * 3. 生命周期函数 `onShow`
             */
            if (priotity > 0) {
                c.detail += '(生命周期函数)';
                c.kind = vscode_1.CompletionItemKind.Field;
                c.sortText = '}'.repeat(priotity);
            }
            else {
                c.sortText = l.name.replace('_', '{');
            }
            return c;
        });
    }
}
exports.default = AutoCompletion;
/**
 * 是否为属性式函数声明
 * 如 属性式声明 `foo:()=>{}`
 * @param text
 */
function getMethodKind(text) {
    return /^\s*[\w_$][\w_$\d]*\s*:/.test(text) ? vscode_1.CompletionItemKind.Property : vscode_1.CompletionItemKind.Method;
}
function autoSuggestCommand() {
    return {
        command: 'editor.action.triggerSuggest',
        title: 'triggerSuggest',
    };
}
//# sourceMappingURL=AutoCompletion.js.map