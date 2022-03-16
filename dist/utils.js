"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFileUp = exports.findStreamPackages = void 0;
const tslib_1 = require("tslib");
const glob_1 = require("glob");
const path_1 = tslib_1.__importStar(require("path"));
const fs_1 = tslib_1.__importStar(require("fs"));
const resolve_dir_1 = tslib_1.__importDefault(require("resolve-dir"));
const StreamPackage_1 = require("./StreamPackage");
function findStreamPackages(rootDir = process.cwd()) {
    const streamPackages = {};
    glob_1.glob.sync((0, path_1.resolve)(rootDir, '**/package.json'), { ignore: ['node_modules'] })
        .map(packagePath => {
        let pkg;
        try {
            let json = (0, fs_1.readFileSync)(packagePath, 'utf8');
            pkg = JSON.parse(json);
        }
        catch (e) {
            // console.warn(packagePath,e);
        }
        return {
            pkg,
            packagePath,
        };
    })
        .filter(obj => { var _a; return ((_a = obj === null || obj === void 0 ? void 0 : obj.pkg) === null || _a === void 0 ? void 0 : _a.streams) !== undefined; })
        .forEach((obj) => {
        obj.streams = obj.pkg.streams;
        obj.path = (0, path_1.dirname)(obj.packagePath);
        const composerPath = (0, path_1.resolve)((0, path_1.dirname)(obj.packagePath), 'composer.json');
        obj.composerPath = (0, fs_1.existsSync)(composerPath) ? composerPath : null;
        if (obj.composerPath) {
            obj.composer = require(obj.composerPath);
        }
        streamPackages[obj.pkg.name] = new StreamPackage_1.StreamPackage(obj);
    });
    return streamPackages;
}
exports.findStreamPackages = findStreamPackages;
function findFileUp(filename, cwd, limit = Infinity) {
    let dirname = (0, path_1.resolve)(cwd ? (0, resolve_dir_1.default)(cwd) : '.');
    let depth = 0;
    let prev;
    do {
        const filepath = (0, path_1.join)(dirname, filename);
        if (fs_1.default.existsSync(filepath)) {
            return filepath;
        }
        depth++;
        prev = dirname;
        dirname = path_1.default.dirname(dirname);
    } while (prev !== dirname && depth <= limit);
}
exports.findFileUp = findFileUp;
;
//# sourceMappingURL=utils.js.map