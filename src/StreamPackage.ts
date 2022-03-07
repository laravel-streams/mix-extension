import { isMainThread } from 'worker_threads';
import { exec, execSync } from 'child_process';

export interface StreamPackageConfigScripts {

    dev?: string | null;
    prod?: string | null;
    watch?: string | null;
    test?: string | null;
}

export type StreamPackageConfigScript = keyof StreamPackageConfigScripts;

export interface StreamPackageConfig {
    output: {
        name: [ string, string ]
        type: 'module' | 'commonjs' | 'assign'
    },
    src: string
    bundler: 'webpack' | 'mix' | 'rollup' | null,
    scripts: StreamPackageConfigScripts
}

export interface StreamPackageInfo {
    pkg: any,
    streams: StreamPackageConfig
    packagePath: string,
    composerPath?: string,
    path: string,
    composer?: any,
}

export class StreamPackage implements StreamPackageInfo {
    static scripts: StreamPackageConfigScript[] = [ 'dev', 'prod', 'watch', 'test' ];
    static manager: 'yarn' | 'pnpm' | 'npm'     = 'yarn';
    public packagePath: string;
    public pkg: any;
    public streams: StreamPackageConfig;
    public path: string;

    constructor(info: StreamPackageInfo) {
        Object.assign(this, info);
    }

    isBundler(name?: StreamPackageConfig['bundler']) {
        if ( name ) {
            return this.streams?.bundler === name;
        }
        return this.streams?.bundler !== undefined;
    }

    hasScript(name: StreamPackageConfigScript) {
        return typeof this.streams?.scripts[ name ] === 'string';
    }

    runScript(name: StreamPackageConfigScript) {
        if ( !isMainThread ) throw new Error('cannot runScriptThreaded, this is not mainThread');
        if ( !this.hasScript(name) ) throw new Error(`Cannot run script '${name}'. It doesn't exist`);
        let bin = StreamPackage.manager;
        let binPath;
        try {
            binPath = execSync('/usr/bin/which ' + bin, {
                cwd     : this.path,
                env     : process.env,
                encoding: 'utf-8',
                stdio   : 'inherit',
                shell   : '/bin/bash',
            });
        } catch (e) {
            return console.error(e);
        }
        let scriptName = this.streams.scripts[ name ];
        const command  = [ binPath, 'run', scriptName ].join(' ');
        const proc     = exec(command, {
            cwd: this.path,
            env: process.env,
        });
        const events   = new Promise((resolve, reject) => {
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
