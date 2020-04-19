"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
const quickParseStle_1 = require("./quickParseStle");
const helper_1 = require("./helper");
const loadScss_1 = require("./loadScss");
const fileCache = {};
function isScss(file) {
    return /\.s[ac]ss/.test(file);
}
function parseStyleFile(file) {
    try {
        let cache = fileCache[file];
        let editor = vscode_1.window.visibleTextEditors.find(e => e.document.fileName === file);
        if (editor) {
            let content = editor.document.getText();
            return { file, styles: quickParseStle_1.quickParseStyle(isScss(file) ? loadScss_1.default({ data: content, file }) : content) };
        }
        else {
            const stat = fs.statSync(file);
            if (cache && stat.mtime <= cache.mtime) {
                return cache.value;
            }
            cache = {
                mtime: stat.mtime,
                value: {
                    file,
                    styles: quickParseStle_1.quickParseStyle(isScss(file) ? loadScss_1.default({ file }) : fs.readFileSync(file).toString()),
                },
            };
            fileCache[file] = cache;
            return cache.value;
        }
    }
    catch (e) {
        return {
            file,
            styles: [],
        };
    }
}
exports.parseStyleFile = parseStyleFile;
function getClass(doc, config) {
    return [...getLocalClass(doc, config), ...getGlobalClass(doc, config)];
}
exports.getClass = getClass;
function getLocalClass(doc, config) {
    let exts = config.styleExtensions || [];
    let dir = path.dirname(doc.fileName);
    let basename = path.basename(doc.fileName, path.extname(doc.fileName));
    let localFile = exts.map(e => path.join(dir, basename + '.' + e)).find(f => fs.existsSync(f));
    return localFile ? [parseStyleFile(localFile)] : [];
}
exports.getLocalClass = getLocalClass;
function getGlobalClass(doc, config) {
    let root = helper_1.getRoot(doc);
    if (!root)
        return [];
    let files = (config.globalStyleFiles || []).map(f => path.resolve(root, f));
    return files.map(parseStyleFile);
}
exports.getGlobalClass = getGlobalClass;
//# sourceMappingURL=StyleFile.js.map