"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
/**
 * js/ts 文件映射缓存
 */
const wxJsMapCache = new Map();
/**
 * 结果缓存
 */
const resultCache = new Map();
/**
 * 保留字段,
 * 用于无限制匹配式函数过滤
 * `if(x){}` 等满足函数正
 */
const reservedWords = ['if', 'switch', 'catch', 'while', 'for', 'constructor'];
function parseScriptFile(file, type, prop) {
    let content = helper_1.getFileContent(file);
    let locs = [];
    let reg = null;
    /**
     * 空白符正则
     */
    const s = '\\s*';
    if (type === 'prop') {
        reg = new RegExp(`^${s}` + prop + `${s}:`, 'gm');
    }
    else if (type === 'method') {
        // prop: () => {}
        // prop: function() {}
        // prop: function xxx() {}
        // prop: (e:{}) => {}
        // reg = new RegExp(`^${s}` + prop + `(${s}:${b}${s}=>|${s}:${s}function|${s}${b}${s}\\{)`, 'gm')
        /**
         * 函数参数表正则
         * 允许参数跨行
         * - 无参数`()`
         * - 有参数`( e )`
         * - 有参类型`( e?:{}= )`
         * - 参数跨行
         * ```ts
         *  (
         *    e: event
         *  )
         * ```
         * ```js
         * /\(\s*(?:[\w\d_$]+(?:[,=:?][\s\S]*?)?)?\)/
         * ```
         */
        const param = `\\(${s}(?:[\\w\\d_$]+(?:[,=:?][\\s\\S]*?)?)?\\)`;
        const async = `(?:async\\s+)?`;
        /**
         * 返回值正则
         * `:type `
         */
        const returnType = `(?::[\\s\\S]*?)?`;
        /**
         * 方法定义正则
         * - 普通方法`prop(...){`
         * - 返回值方法`prop(...): void {`
         * - 异步方法`async prop(...){`
         */
        const methodReg = `${async}(${prop})${s}${param}${s}${returnType}\\{`;
        /**
         * 属性式函数定义 正则
         * - 箭头函数`prop: (...) =>`
         * - 异步箭头函数`prop: async (...) =>`
         * - 普通函数声明`prop: function...`
         * - 异步函数声明`prop: async function...`
         */
        const propFuncReg = `(${prop})${s}:${s}${async}(?:${param}${s}${returnType}=>|function\\W)`;
        reg = new RegExp(`^${s}(${methodReg}|${propFuncReg})`, 'gm');
    }
    if (!reg)
        return locs;
    helper_1.match(content, reg)
        .filter(mat => {
        const property = mat[2] || mat[3];
        // 精确匹配或者不是关键字
        return property === prop || !reservedWords.includes(property);
    })
        .forEach(mat => {
        const property = mat[2] || mat[3] || prop;
        let pos = helper_1.getPositionFromIndex(content, mat.index + mat[0].indexOf(property));
        let endPos = new vscode_1.Position(pos.line, pos.character + property.length);
        locs.push({
            loc: new vscode_1.Location(vscode_1.Uri.file(file), new vscode_1.Range(pos, endPos)),
            name: property,
            detail: mat[1] || mat[0],
        });
    });
    return locs;
}
/**
 * 解析文件映射关系
 * @param wxmlFile
 */
function getScriptFile(wxmlFile) {
    if (wxJsMapCache.has(wxmlFile)) {
        return wxJsMapCache.get(wxmlFile);
    }
    const dir = path.dirname(wxmlFile);
    const base = path.basename(wxmlFile, path.extname(wxmlFile));
    const exts = ['ts', 'js']; // 先ts 再js 防止读取编译后的
    for (const ext of exts) {
        const file = path.join(dir, base + '.' + ext);
        if (fs.existsSync(file)) {
            wxJsMapCache.set(wxmlFile, file);
            return file;
        }
    }
    return undefined;
}
/**
 * 获取文件版本信息,
 * 编辑器 和 文件系统
 * 只能用===判断
 * @param file
 */
function getVersion(file) {
    const editor = vscode_1.window.visibleTextEditors.find(e => e.document.fileName === file);
    if (editor) {
        return editor.document.version;
    }
    else {
        return fs.statSync(file).mtimeMs;
    }
}
/**
 * 提取脚本文件中的定义
 * @param wxmlFile
 * @param type
 * @param prop
 */
function getProp(wxmlFile, type, prop) {
    const scriptFile = getScriptFile(wxmlFile);
    if (!scriptFile)
        return [];
    const key = `${scriptFile}?${type}&${prop}`;
    const cache = resultCache.get(key);
    const version = getVersion(scriptFile);
    if (cache && cache.version === version) {
        return cache.data;
    }
    const result = parseScriptFile(scriptFile, type, prop);
    if (result && result.length > 0) {
        resultCache.set(key, { version, data: result });
    }
    return result;
}
exports.getProp = getProp;
//# sourceMappingURL=ScriptFile.js.map