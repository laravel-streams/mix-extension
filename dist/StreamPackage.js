"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamPackage = void 0;
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
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
StreamPackage.manager = 'yarn';
//# sourceMappingURL=StreamPackage.js.map