import { StreamPackage } from './StreamPackage';
import { glob } from 'glob';
import { dirname, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { StreamPackageInfo } from './types';
import { StreamPackageCollection } from './StreamPackageCollection';
import { ExposeExternalResolver } from './ExposeExternalResolver';


export class StreamPackageManager {
    packages: StreamPackageCollection;
    package: StreamPackage;

    constructor(rootDir: string) {
        this.packages = this.findStreamPackages(rootDir);
    }

    public setCurrentPackage(name: string) {
        this.package = this.packages.get(name);
        return this;
    }

    resolveExposeExternal(){
        let resolver = new ExposeExternalResolver(this.packages, this.package);
        return resolver.resolve();
    }


    protected findStreamPackages(rootDir: string = process.cwd()): StreamPackageCollection {
        const streamPackages: Record<string, StreamPackage> = {};

        glob.sync(resolve(rootDir, '**/package.json'), { ignore: [ 'node_modules' ] })
            .map(packagePath => {
                let pkg;
                try {
                    let json = readFileSync(packagePath, 'utf8');
                    pkg      = JSON.parse(json);
                } catch (e) {
                    // console.warn(packagePath,e);
                }
                return {
                    pkg,
                    packagePath,
                };
            })
            .filter(obj => obj?.pkg?.streams !== undefined)
            .forEach((obj: StreamPackageInfo) => {
                obj.streams        = obj.pkg.streams;
                obj.path           = dirname(obj.packagePath);
                const composerPath = resolve(dirname(obj.packagePath), 'composer.json');
                obj.composerPath   = existsSync(composerPath) ? composerPath : null;
                if ( obj.composerPath ) {
                    obj.composer = require(obj.composerPath);
                }
                streamPackages[ obj.pkg.name ] = new StreamPackage(obj, this);
            });


        return new StreamPackageCollection(streamPackages);

    }
}
