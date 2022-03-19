import mix from 'laravel-mix';
import { ComponentInterface } from 'laravel-mix/types/component';
import { basename, dirname, resolve } from 'path';
import { Options as TSConfig } from 'ts-loader';
import webpack from 'webpack';
import { TransformOptions } from '@babel/core';
import { findFileUp,  objectify } from './utils';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { PackageJson } from './types';
import { StreamPackage } from './StreamPackage';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { readJSONSync, writeJSONSync } from 'fs-extra';
import { Exposer } from './Exposer';
import { StreamPackageManager } from './StreamPackageManager';
import { StreamPackageCollection } from './StreamPackageCollection';
import { Resolved } from './ExposeExternalResolver';

let isProd = mix.inProduction();
let isDev  = !mix.inProduction();

const line = (message: string) => {
    process.stdout.write(message + '\n');
};

const dependencies = [
    // "@babel/core",
    // "@babel/plugin-syntax-dynamic-import",
    // "@babel/preset-env",
    // "laravel-mix",
    // "ts-lib",
    // "ts-loader",
    // "ts-node",
    // "typescript",
    // "webpack",
];

/** npm package vendor name, excluding the @ sign. like `laravel-streams` */
export type PackageName = string
/** The exported library name prefix like 'streams' */
export type PackageNamespacePrefix = string
/** The exported library name like 'api' */
export type PackageNamespaceName = string

export interface StreamsMixExtensionOptions {
    ts?: {
        configFile?: string
        declarationDir?: string
        declaration?: boolean
    };
    tsConfig?: Partial<TSConfig>;
    alterBabelConfig?: boolean;
    combineTsLoaderWithBabel?: boolean;
    analyse?: boolean;
    cwd?: string; // current dir
    /**
     * If the {@see StreamsMixExtensionOptions.streamsPackages} doesn't comply with your wishes, then do it yourself:
     */
    externals?: Record<string, string>;

    exposePrefix?: string;
    expose?: Record<string, string>;
    use?: Record<string, string>;

    /**
     * The extension needs to know the root project's absolute path.
     * It will search upwards from the directory mix is called for this file
     * defaults to 'artisan'
     */
    rootProjectFile?: string;
    entryFile?: string; //resources/lib/index.ts
    filename?: string;
    chunkFilename?: string;
    path?: string;
    name: string | [ string, string ] | undefined;
    type: 'var' | 'module' | 'assign' | 'assign-properties' | 'this' | 'window' | 'self' | 'global' | 'commonjs' | 'commonjs2' | 'commonjs-module' | 'amd' | 'amd-require' | 'umd' | 'umd2' | 'jsonp' | 'system';
}


export class StreamsMixExtension implements ComponentInterface {
    manager: StreamPackageManager;

    get streamPackages(): StreamPackageCollection { return this.manager.packages; }

    get streamPackage(): StreamPackage {return this.manager.package;}

    options: StreamsMixExtensionOptions;
    pkg: PackageJson;
    exposeFilePath: string;
    entryFilePath: string;

    public register(options: StreamsMixExtensionOptions) {
        const cwd    = options.cwd || process.cwd();
        this.options = {
            combineTsLoaderWithBabel: true,
            alterBabelConfig        : true,
            rootProjectFile         : 'artisan',
            tsConfig                : {},
            cwd                     : cwd,
            analyse                 : false,
            entryFile               : 'resources/lib/index.ts',
            path                    : resolve(cwd, 'resources/public'),
            filename                : 'js/[name].js',
            chunkFilename           : 'js/chunk.[name].js',
            type                    : 'window',
            externals               : {},
            exposePrefix            : 'streams.vendor',
            expose                  : {},
            use                     : {},
            ...options,
            ts: {
                configFile    : resolve(cwd, 'webpack.tsconfig.json'),
                declarationDir: resolve(cwd, 'resources/public/types'),
                declaration   : true,
                ...options.ts || {},
            },
        };
        this.pkg     = require(resolve(cwd, 'package.json'));
        if ( !this.pkg?.streams ) {
            throw new Error(`Package [${this.pkg.name}] does not have a 'streams' configuration in its package.json`);
        }
        this.manager = new StreamPackageManager(this.getRootProjectPath());
        this.manager.setCurrentPackage(this.pkg.name);
        this.entryFilePath  = resolve(cwd, this.options.entryFile);
        this.exposeFilePath = resolve(dirname(this.entryFilePath), '_expose.ts');
    }

    formatName(name: string): string {
        return name
        .replace(/\@/gm, '')
        .replace(/\//gm, '__')
        .replace(/\-/gm, '_')
        .replace(/\./gm, '');
    }

    getImportName(name:string){
        return this.options.exposePrefix + '.' + this.formatName(name);
    }


    createExposeFile(expose:string[]) {
        const lines = [];
        let prefix = [];
        let segments = this.options.exposePrefix.split('.');
        for(let segment of segments){
            prefix.push(segment)
            lines.push('//@ts-ignore')
            lines.push(`window.${prefix.join('.')} = window.${prefix.join('.')} || {};`)
        }
        expose.forEach(name => {
            let formatName = this.formatName(name)
            lines.push(`import * as ${formatName} from '${name}';`);
            lines.push('//@ts-ignore');
            lines.push(`window.${this.options.exposePrefix}.${formatName} = ${formatName};`);
        });
        const content = lines.join('\n');
        this.deleteExposeFile();
        writeFileSync(this.exposeFilePath, content, 'utf8');
    }

    deleteExposeFile() {
        if ( existsSync(this.exposeFilePath) ) {
            unlinkSync(this.exposeFilePath);
        }
    }

    addExposeFileToEntry() {
        let exposeFileName = basename(this.exposeFilePath);
        let importLine     = `import './${exposeFileName}';`;
        let lines          = readFileSync(this.entryFilePath, 'utf8').split('\n');
        if ( !lines.includes(importLine) ) {
            lines.push(importLine);
        }
        writeFileSync(this.entryFilePath, lines.join('\n'), 'utf8');
    }

    removeExposeFileFromEntry() {
        let exposeFileName = basename(this.exposeFilePath);
        let importLine     = `import './${exposeFileName}';`;
        let lines          = readFileSync(this.entryFilePath, 'utf8').split('\n');
        let index          = lines.findIndex(l => l.trim() === importLine);
        if ( index ) {
            lines.splice(index, 1);
            writeFileSync(this.entryFilePath, lines.join('\n'), 'utf8');
        }
    }

    protected path(...parts: string[]) {
        return resolve(this.options.cwd, ...parts);
    }

    public dependencies() {return dependencies;}

    resolved:Resolved

    public boot() {
        this.resolved = this.manager.resolveExposeExternal();
        this.createExposeFile(this.resolved.expose);
        this.addExposeFileToEntry();
        process.on('exit', () => {
            this.removeExposeFileFromEntry();
            this.deleteExposeFile();
        });
        mix.options({
            terser: {
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames    : true,
                },
            },
        });
    }

    public name() {return 'streams';}

    public webpackConfig(config: webpack.Configuration) {
        config.devtool       = isDev ? 'inline-cheap-module-source-map' : false;
        config.resolve       = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias || {},
        };
        config.externals     = this.options.externals;

        config.experiments              = config.experiments || {};
        config.experiments.outputModule = this.options.type === 'module';
        let entries                     = config.entry as string[];
        let entryFile                   = this.path(this.options.entryFile);
        let name                        = Array.isArray(this.options.name) ? this.options.name.join('/') : this.options.name;
        let filename                    = Array.isArray(this.options.name) ? this.options.name[ this.options.name.length - 1 ] : this.options.name;
        Object.entries(entries).forEach(([ key, value ]) => {
            if ( Array.isArray(value) ) {
                config.entry[ key ] = value.filter(entry => entry !== entryFile);
                if ( config.entry[ key ].length === 0 ) {
                    delete config.entry[ key ];
                }
            }
        });


        config.entry[ name ] = {
            import  : entryFile,
            filename: `js/${filename}.js`,
            library : {
                name: this.options.name,
                type: this.options.type,
            } as any,
        };

        this.streamPackages.forEach(streamPackage => {
            if ( false === [ 'mix', 'webpack' ].includes(streamPackage.streams.bundler) ) {
                return;
            }
            let [ prefix, name ] = streamPackage.streams.output.name;
            let packageName      = streamPackage.pkg.name;
            if ( this.options.name[ 0 ] === prefix && this.options.name[ 1 ] === name ) return;
            config.externals[ packageName ] = [ prefix, name ];
        });

        this.resolved.external.forEach(name => {
            config.externals[ name ] = this.getImportName(name).split('.');
        });

        config.output       = {
            path                                 : this.options.path,
            filename                             : this.options.filename,
            chunkFilename                        : this.options.chunkFilename,
            library                              : {
                name: this.options.name,
                type: this.options.type,
            },
            publicPath                           : `/vendor/${this.options.name[ 0 ]}/${this.options.name[ 1 ]}/`,
            devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]',
            devtoolModuleFilenameTemplate        : info => {
                var $filename = 'sources://' + info.resourcePath;
                $filename     = 'webpack:///' + info.resourcePath; // +'?' + info.hash;
                if ( info.resourcePath.match(/\.vue$/) && !info.allLoaders.match(/type=script/) && !info.query.match(/type=script/) ) {
                    $filename = 'webpack-generated:///' + info.resourcePath; // + '?' + info.hash;
                }
                return $filename;
            },

        };
        config.optimization = {
            ...config.optimization,
            moduleIds: 'named',
            chunkIds : 'named',
            minimize : isProd,
        };

        const ruleIndex = config.module.rules.findIndex((rule: webpack.RuleSetRule) => typeof rule.loader === 'string' && rule.loader.endsWith('ts-loader/index.js'));
        config.module.rules.splice(ruleIndex, 1);

        if ( this.options.analyse ) {
            config.plugins.push(new BundleAnalyzerPlugin({
                analyzerMode  : 'static',
                reportFilename: './bundle-analyzer.html',
                defaultSizes  : 'gzip',
                openAnalyzer  : false,
            }));
        }

    }


    public webpackRules(): webpack.RuleSetRule | webpack.RuleSetRule[] {
        return [ {
            test   : /\.tsx?$/,
            exclude: /node_modules\//,
            use    : [
                // { loader: 'babel-loader', options: this.babelConfig() },
                { loader: 'ts-loader', options: this.tsConfig() },
            ],
        } ];
    }


    protected getBabelConfig(): TransformOptions {
        return {
            babelrc   : false,
            configFile: false,

            compact   : isProd,
            sourceMaps: isDev,
            comments  : isDev,
            presets   : [
                [ '@babel/preset-env', {
                    'useBuiltIns': false,
                    'targets'    : '> 0.25%, not dead',
                } ],
            ],
            plugins   : [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-transform-runtime',
            ],
        };
    }

    public babelConfig(): TransformOptions {
        return this.options.alterBabelConfig ? this.getBabelConfig() : undefined;
    }

    public tsConfig(): Partial<TSConfig> {
        return {
            appendTsSuffixTo    : [ /\.vue$/ ],
            transpileOnly       : true,
            logLevel            : 'INFO',
            logInfoToStdOut     : true,
            happyPackMode       : true,
            experimentalWatchApi: true,
            configFile          : this.options.ts.configFile,
            compilerOptions     : {
                target        : 'es6' as any,
                module        : 'es6' as any,
                declaration   : this.options.ts.declaration,
                declarationDir: this.options.ts.declarationDir,
                importHelpers : true,
                sourceMap     : isDev,
                removeComments: isProd,
            },
        };
    };

    public getRootProjectPath() {
        const filePath = findFileUp(this.options.rootProjectFile, __dirname);
        if ( !filePath ) {
            throw new Error(`could not find root project path based on searching for file "${this.options.rootProjectFile}"`);
        }
        return dirname(filePath);
    }

}
