"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFileUp = exports.findStreamPackages = exports.StreamPackage = void 0;
const tslib_1 = require("tslib");
const glob_1 = require("glob");
const path_1 = (0, tslib_1.__importStar)(require("path"));
const fs_1 = (0, tslib_1.__importStar)(require("fs"));
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const resolve_dir_1 = (0, tslib_1.__importDefault)(require("resolve-dir"));
class StreamPackage {
    constructor(info) {
        Object.assign(this, info);
    }
    isBundler(name) {
        var _a, _b;
        if (name) {
            return ((_a = this.streams) === null || _a === void 0 ? void 0 : _a.bundler) === name;
        }
        return ((_b = this.streams) === null || _b === void 0 ? void 0 : _b.bundler) !== undefined;
    }
    hasScript(name) {
        var _a;
        return typeof ((_a = this.streams) === null || _a === void 0 ? void 0 : _a.scripts[name]) === 'string';
    }
    runScript(name) {
        if (!worker_threads_1.isMainThread)
            throw new Error('cannot runScriptThreaded, this is not mainThread');
        if (!this.hasScript(name))
            throw new Error(`Cannot run script '${name}'. It doesn't exist`);
        let bin = StreamPackage.manager;
        let binPath;
        try {
            binPath = (0, child_process_1.execSync)('/usr/bin/which ' + bin, {
                cwd: this.path,
                env: process.env,
                encoding: 'utf-8',
                stdio: 'inherit',
                shell: '/bin/bash',
            });
        }
        catch (e) {
            return console.error(e);
        }
        let scriptName = this.streams.scripts[name];
        const command = [binPath, 'run', scriptName].join(' ');
        const proc = (0, child_process_1.exec)(command, {
            cwd: this.path,
            env: process.env,
        });
        const events = new Promise((resolve, reject) => {
            proc.on('exit', (code, signal) => reject({ event: 'exit', code, signal }));
            proc.on('error', error => reject({ event: 'error', error }));
            proc.on('close', (code, signal) => reject({ event: 'close', code, signal }));
            proc.on('disconnect', error => reject({ event: 'disconnect', error }));
            proc.on('message', (message, sendHandle) => {
                console.log('spawn message from command', command, ' message: ', message);
            });
        });
        events.catch(reason => {
            proc.kill();
            proc.unref();
            return reason;
        });
        return { proc, events };
    }
}
exports.StreamPackage = StreamPackage;
StreamPackage.scripts = ['dev', 'prod', 'watch', 'test'];
StreamPackage.manager = 'pnpm';
function findStreamPackages(rootDir = process.cwd()) {
    const streamPackages = {};
    glob_1.glob.sync((0, path_1.resolve)(rootDir, '**/package.json'), { ignore: ['node_modules'] })
        .map(packagePath => ({ pkg: require(packagePath), packagePath }))
        .filter(obj => { var _a; return ((_a = obj === null || obj === void 0 ? void 0 : obj.pkg) === null || _a === void 0 ? void 0 : _a.streams) !== undefined; })
        .forEach((obj) => {
        obj.streams = obj.pkg.streams;
        obj.path = (0, path_1.dirname)(obj.packagePath);
        const composerPath = (0, path_1.resolve)((0, path_1.dirname)(obj.packagePath), 'composer.json');
        obj.composerPath = (0, fs_1.existsSync)(composerPath) ? composerPath : null;
        if (obj.composerPath) {
            obj.composer = require(obj.composerPath);
        }
        streamPackages[obj.pkg.name] = new StreamPackage(obj);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLCtCQUE0QjtBQUM1QiwwREFBb0Q7QUFDcEQsc0RBQW9DO0FBQ3BDLG1EQUE4QztBQUM5QyxpREFBK0M7QUFFL0MsMkVBQXFDO0FBK0JyQyxNQUFhLGFBQWE7SUFRdEIsWUFBWSxJQUF1QjtRQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsU0FBUyxDQUFDLElBQXFDOztRQUMzQyxJQUFLLElBQUksRUFBRztZQUNSLE9BQU8sQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLE9BQU8sTUFBSyxJQUFJLENBQUM7U0FDekM7UUFDRCxPQUFPLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxPQUFPLE1BQUssU0FBUyxDQUFDO0lBQy9DLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBK0I7O1FBQ3JDLE9BQU8sT0FBTyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsT0FBTyxDQUFFLElBQUksQ0FBRSxDQUFBLEtBQUssUUFBUSxDQUFDO0lBQzdELENBQUM7SUFFRCxTQUFTLENBQUMsSUFBK0I7UUFDckMsSUFBSyxDQUFDLDZCQUFZO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1FBQ3pGLElBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLElBQUkscUJBQXFCLENBQUMsQ0FBQztRQUM5RixJQUFJLEdBQUcsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDO1FBQ2hDLElBQUksT0FBTyxDQUFDO1FBQ1osSUFBSTtZQUNBLE9BQU8sR0FBRyxJQUFBLHdCQUFRLEVBQUMsaUJBQWlCLEdBQUcsR0FBRyxFQUFFO2dCQUN4QyxHQUFH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