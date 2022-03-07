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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyZWFtUGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9TdHJlYW1QYWNrYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1EQUE4QztBQUM5QyxpREFBK0M7QUErQi9DLE1BQWEsYUFBYTtJQVF0QixZQUFZLElBQXVCO1FBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBcUM7O1FBQzNDLElBQUssSUFBSSxFQUFHO1lBQ1IsT0FBTyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsT0FBTyxNQUFLLElBQUksQ0FBQztTQUN6QztRQUNELE9BQU8sQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLE9BQU8sTUFBSyxTQUFTLENBQUM7SUFDL0MsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUErQjs7UUFDckMsT0FBTyxPQUFPLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUEsS0FBSyxRQUFRLENBQUM7SUFDN0QsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUErQjtRQUNyQyxJQUFLLENBQUMsNkJBQVk7WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7UUFDekYsSUFBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDO1FBQzlGLElBQUksR0FBRyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDaEMsSUFBSSxPQUFPLENBQUM7UUFDWixJQUFJO1lBQ0EsT0FBTyxHQUFHLElBQUEsd0JBQVEsRUFBQyxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7Z0JBQ3hDLEdBQUcsRUFBTyxJQUFJLENBQUMsSUFBSTtnQkFDbkIsR0FBRyxFQUFP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