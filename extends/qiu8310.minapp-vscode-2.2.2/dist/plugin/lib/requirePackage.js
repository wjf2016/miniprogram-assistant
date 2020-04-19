"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const resolve = require("resolve");
const readPkgUp = require("read-pkg-up");
const fs_1 = require("fs");
function findPkg(fspath, pkgName) {
    const res = readPkgUp.sync({ cwd: fspath, normalize: false });
    const { root } = path.parse(fspath);
    if (res &&
        res.package &&
        ((res.package.dependencies && res.package.dependencies[pkgName]) ||
            (res.package.devDependencies && res.package.devDependencies[pkgName]) ||
            fs_1.existsSync(path.join(path.dirname(res.path), 'node_modules', pkgName)))) {
        return resolve.sync(pkgName, { basedir: res.path });
    }
    else if (res && res.path) {
        const parent = path.resolve(path.dirname(res.path), '..');
        if (parent !== root) {
            return findPkg(parent, pkgName);
        }
    }
    return;
}
/**
 * 优先尝试加载项目安装的npm包
 * @param fspath file system path starting point to resolve package
 * @param pkgName package's name to require
 * @returns module
 */
function requireLocalPkg(fspath, pkgName) {
    let modulePath;
    try {
        modulePath = findPkg(fspath, pkgName);
        if (modulePath !== void 0) {
            return require(modulePath);
        }
    }
    catch (e) {
        console.warn(`Failed to load ${pkgName} from ${modulePath}. Using bundled.`);
    }
    return require(pkgName);
}
exports.requireLocalPkg = requireLocalPkg;
//# sourceMappingURL=requirePackage.js.map