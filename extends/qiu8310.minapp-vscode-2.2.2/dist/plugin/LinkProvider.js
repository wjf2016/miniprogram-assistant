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
const fs = require("fs");
const path = require("path");
class default_1 {
    constructor(config) {
        this.config = config;
    }
    provideDocumentLinks(doc, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getLinks(doc);
        });
    }
    getLinks(doc) {
        let links = [];
        let { linkAttributeNames } = this.config;
        if (!linkAttributeNames.length)
            return links;
        let roots = this.config.getResolveRoots(doc);
        const rootsWithDir = [path.dirname(doc.fileName), ...roots];
        let regexp = new RegExp(`\\b(${linkAttributeNames.join('|')})=['"]([^'"]+)['"]`, 'g');
        let remote = /^\w+:\/\//; // 是否是远程路径，如 "http://" ...
        doc.getText().replace(regexp, (raw, tag, key, index) => {
            let isRemote = remote.test(key);
            let file;
            if (isRemote) {
                file = key;
            }
            else if (key.startsWith('/')) {
                // 绝对路径解析
                file = roots.map(root => path.join(root, key)).find(f => fs.existsSync(f));
            }
            else {
                file = rootsWithDir.map(dir => path.resolve(dir, key)).find(file => fs.existsSync(file));
            }
            if (file) {
                let offset = index + tag.length + 2;
                let startPoint = doc.positionAt(offset);
                let endPoint = doc.positionAt(offset + key.length);
                links.push(new vscode_1.DocumentLink(new vscode_1.Range(startPoint, endPoint), isRemote ? vscode_1.Uri.parse(file) : vscode_1.Uri.file(file)));
            }
            return raw;
        });
        return links;
    }
}
exports.default = default_1;
//# sourceMappingURL=LinkProvider.js.map