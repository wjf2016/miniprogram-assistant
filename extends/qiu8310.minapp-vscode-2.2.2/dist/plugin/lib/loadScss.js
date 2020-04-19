"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const fs_1 = require("fs");
const requirePackage_1 = require("./requirePackage");
/**
 * 尝试加载本地 node-sass/sass
 */
function autoRequireSass(file) {
    try {
        return requirePackage_1.requireLocalPkg(file, 'sass');
    }
    catch (error) {
        return requirePackage_1.requireLocalPkg(file, 'node-sass');
    }
}
/**
 * 渲染scss
 * @param op sass 配置
 */
function default_1(op) {
    try {
        const options = Object.assign({}, config_1.config.sass, op, { sourceMap: false, sourceMapContents: false });
        return autoRequireSass(op.file || process.cwd())
            .renderSync(options)
            .css.toString();
    }
    catch (error) {
        // sass 渲染失败退回
        console.error(error);
        return op.data || (op.file ? fs_1.readFileSync(op.file).toString() : '');
    }
}
exports.default = default_1;
//# sourceMappingURL=loadScss.js.map