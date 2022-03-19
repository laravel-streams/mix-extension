import { isMainThread } from 'worker_threads';
import { exec, execSync } from 'child_process';
import { StreamPackageConfig, StreamPackageConfigScript, StreamPackageInfo } from './types';
import { PackageManifest } from '@pnpm/types';
import { getDependencies } from './dependencies';
import { DependencyCollection } from './DependencyCollection';
import { StreamPackageCollection } from './StreamPackageCollection';
import { StreamPackageManager } from './StreamPackageManager';

export class StreamPackage implements StreamPackageInfo {
    static scripts: StreamPackageConfigScript[] = [ 'dev', 'prod', 'watch', 'test' ];
    static manager: 'yarn' | 'pnpm' | 'npm'     = 'yarn';
    public packagePath: string;
    public pkg: PackageManifest;
    public streams: StreamPackageConfig;
    public path: string;

    public get dependencies(): DependencyCollection {
        let deps = getDependencies(this.pkg, this.manager);

        return deps;
    }

    public get vendorDependencies():DependencyCollection {
        return this.dependencies.withoutStreamPackages();
    }

    public get streamPackageDependencies():DependencyCollection {
        return this.dependencies.streamPackages();
    }

    public getStreamPackageDependencies(streamPackages:StreamPackageCollection):StreamPackage[]{
        return this.streamPackageDependencies.keySeq().toArray().map(name => streamPackages.get(name));
    }

    constructor(info: StreamPackageInfo, protected manager:StreamPackageManager) {
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


/*

streampackage
    depends on streampackage(s) => external streams.<name>
    depends on own dependencies => expose
    depends on streampackages => each streampackage => dependencies without streampackages => remove dependency from expose and add to external


 */
