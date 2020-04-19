"use strict";
/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc^126.com> (https://github.com/qiu8310)
*******************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
function getAttrName(str) {
    if (/\s([\w-:.]+)=%*$/.test(str)) {
        return RegExp.$1;
    }
    return '';
}
exports.getAttrName = getAttrName;
// 也可以是以 @ 开头的字符，触发事件
const TAG_ATTR_REGEXP = /^(@|@?[\w-:.]+)\s*(=\s*("[^"]*"|'[^']*'|\w+))?\s*/;
function getAttrs(text) {
    let attrs = {};
    getAttrs2(text, attrs);
    return attrs;
}
exports.getAttrs = getAttrs;
function getAttrs2(text, attrs) {
    return match(text, TAG_ATTR_REGEXP, m => {
        attrs[stripColon(m[1])] = m[2] ? strip(m[3]) : true;
        // 记录原生的末修改过的字段
        attrs['__' + m[1]] = m[2] ? m[3] : true;
    });
}
exports.getAttrs2 = getAttrs2;
function stripColon(name) {
    return (name
        // .replace(':', '')
        // .replace(/^@/, 'bind')
        .replace(/\..*$/, '')); // 去除修饰字符，如 .default, .stop, .user, .sync
}
function strip(val) {
    return val.replace(/^['"]|['"]$/g, '');
}
function match(str, reg, cb) {
    let mat;
    while (str.length && (mat = str.match(reg))) {
        if (cb(mat))
            break;
        str = str.slice(mat[0].length);
    }
    return str;
}
//# sourceMappingURL=base.js.map