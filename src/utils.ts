import { glob } from 'glob';
import path, { dirname, join, resolve } from 'path';
import fs, { existsSync, readFileSync } from 'fs';

import resolveDir from 'resolve-dir';
import { StreamPackage, StreamPackageInfo } from './StreamPackage';


export function findStreamPackages(rootDir: string = process.cwd()): Record<string, StreamPackage> {
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
            streamPackages[ obj.pkg.name ] = new StreamPackage(obj);
        });


    return streamPackages;

}

export function findFileUp(filename: string, cwd: string, limit: number = Infinity) {
    let dirname = resolve(cwd ? resolveDir(cwd) : '.');
    let depth   = 0;
    let prev;

    do {
        const filepath = join(dirname, filename);

        if ( fs.existsSync(filepath) ) {
            return filepath;
        }

        depth ++;
        prev    = dirname;
        dirname = path.dirname(dirname);
    } while ( prev !== dirname && depth <= limit );
};
