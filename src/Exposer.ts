import { StreamsMixExtension, StreamsMixExtensionOptions } from './StreamsMixExtension';
import { StreamPackage } from './StreamPackage';
import { basename, dirname, resolve } from 'path';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { readJSONSync, writeJSONSync } from 'fs-extra';
import { objectify } from './utils';
import { StreamPackageCollection } from './StreamPackageCollection';


/*

streampackage
    depends on streampackage(s) => external streams.<name>
    depends on own dependencies => expose
    depends on streampackages => each streampackage => dependencies without streampackages => remove dependency from expose and add to external


 */


export class Exposer {
    get streamPackages(): StreamPackageCollection {return this.extension.streamPackages;}
    get streamPackage(): StreamPackage {return this.extension.streamPackage;}
    get o(): StreamsMixExtensionOptions {return this.extension.options;}

    filePath:string;
    mapPath:string;

    constructor(
        protected extension: StreamsMixExtension,
    ) {
        this.filePath = resolve(dirname(this.extension.entryFilePath), '_expose.ts');
        this.mapPath = resolve(__dirname, '../expose.map.json');
    }


    formatName(name: string): string {
        return name
        .replace(/\@/gm, '')
        .replace(/\//gm, '__')
        .replace(/\-/gm, '_')
        .replace(/\./gm, '');
    }

    getStreamExposeMap() {
        const map: Record<string, string> = {};
        this.streamPackage.expose.forEach(name => {
            map[ name ] = this.formatName(name);
        });
        return map;
    }

    getExternals() {
        let map = this.getExposeMap().map;
        Object.keys(this.getStreamExposeMap()).forEach(key => {
            if ( key in map ) {
                delete map[ key ];
            }
        });
        return map;
    }

    getExposeMap() {
        let exposeMap = { map: {} };
        if ( existsSync(this.mapPath) ) {
            exposeMap = readJSONSync(this.mapPath, 'utf8');
        }
        return exposeMap;
    }

    updateExposeMap(exportMap: Record<string, string>) {
        let exposeMap = this.getExposeMap();
        exportMap     = Object.entries(exportMap).map(([ name, importName ]) => [ name, (this.o.exposePrefix + importName).split('.') ]).reduce(objectify, {});
        Object.assign(exposeMap.map, exportMap);
        writeJSONSync(this.mapPath, exposeMap, 'utf8');
    }

    createExposeFile(exportMap: Record<string, string>) {
        const lines = [
            '//@ts-ignore',
            'window.streams = window.streams || {}',
            '//@ts-ignore',
            'window.streams.vendor = window.streams.vendor || {}',
        ];
        Object.entries(exportMap).forEach(([ name, importName ]) => {
            lines.push(`import * as ${importName} from '${name}';`);
            lines.push('//@ts-ignore',)
            lines.push(`window.${this.o.exposePrefix}${importName} = ${importName};`);
        });
        const content = lines.join('\n');
        this.deleteExposeFile();
        writeFileSync(this.filePath, content, 'utf8');
    }

    deleteExposeFile() {
        if ( existsSync(this.filePath) ) {
            unlinkSync(this.filePath);
        }
    }

    addExposeFileToEntry() {
        let exposeFileName = basename(this.filePath);
        let importLine     = `import './${exposeFileName}';`;
        let lines          = readFileSync(this.extension.entryFilePath, 'utf8').split('\n');
        if ( !lines.includes(importLine) ) {
            lines.unshift(importLine);
        }
        writeFileSync(this.extension.entryFilePath, lines.join('\n'), 'utf8');
    }

    removeExposeFileFromEntry() {
        let exposeFileName = basename(this.filePath);
        let importLine     = `import './${exposeFileName}';`;
        let lines          = readFileSync(this.extension.entryFilePath, 'utf8').split('\n');
        let index = lines.findIndex(l => l.trim() === importLine)
        if(index){
            lines.splice(index,1);
            writeFileSync(this.extension.entryFilePath, lines.join('\n'), 'utf8');
        }
    }

}
