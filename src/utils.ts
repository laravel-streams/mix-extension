import path, { join, resolve } from 'path';
import fs from 'fs';

import resolveDir from 'resolve-dir';
import { Map as EMap } from 'extendable-immutable';
import { Map as IMap } from 'immutable';

export interface Map<K extends string, V> extends IMap<K, V> {
    constructor(obj)
}

export class Map<K extends string, V> extends EMap<K, V> {
    constructor(obj) {
        super(obj);
        this.asMutable()
    }
}

/**
 *
 * @param obj
 * @param k
 * @param v
 * @example
 *
 * params = Object.entries(params).filter(([ key, value ]) => {
 *     return value.toString().length > 0;
 * }).reduce(utils.objectify, {});
 *
 */
export const objectify = (obj, [ k, v ]) => ({ ...obj, [ k ]: v });


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
