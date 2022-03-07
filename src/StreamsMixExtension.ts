import mix from 'laravel-mix';
import { ComponentInterface } from 'laravel-mix/types/component';
import { dirname, resolve } from 'path';
import { Options as TSConfig } from 'ts-loader';
import * as webpack from 'webpack';
import { TransformOptions } from '@babel/core';
import { findFileUp, findStreamPackages } from './utils';

let isProd = mix.inProduction();
let isDev  = !mix.inProduction();

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

    /**
     * Will result into :
     * ```ts
     * // config.externals['@' + PackageVendor + '/' + PackageNamespacePrefix] = [PackageNamespacePrefix,PackageNamespaceName]
     * config.externals['@laravel-streams/api'] = ['streams','api']
     * ```
     */
    streamsPackages?: Record<PackageName, [ PackageNamespacePrefix, PackageNamespaceName[] ]>;
    /**
     * If the {@see StreamsMixExtensionOptions.streamsPackages} doesn't comply with your wishes, then do it yourself:
     */
    externals?: Record<string, string>;

    /**
     * The extension needs to know the root project's absolute path.
     * It will search upwards from the directory mix is called for this file
     * defaults to 'artisan'
     */
    rootProjectFile?: string;
    filename?: string;
    chunkFilename?: string;
    path?: string;
    name: [ string, string ] | undefined;
    type: 'var' | 'module' | 'assign' | 'assign-properties' | 'this' | 'window' | 'self' | 'global' | 'commonjs' | 'commonjs2' | 'commonjs-module' | 'amd' | 'amd-require' | 'umd' | 'umd2' | 'jsonp' | 'system';
}


export class StreamsMixExtension implements ComponentInterface {

    options: StreamsMixExtensionOptions;

    public register(options: StreamsMixExtensionOptions) {
        this.options = {
            combineTsLoaderWithBabel: true,
            alterBabelConfig        : true,
            rootProjectFile         : 'artisan',
            tsConfig                : {},
            path                    : resolve(process.cwd(), 'resources/public'),
            filename                : 'js/[name].js',
            chunkFilename           : 'js/chunk.[name].js',
            type                    : 'window',
            ...options,
            ts             : {
                configFile    : resolve(process.cwd(), 'webpack.tsconfig.json'),
                declarationDir: resolve(process.cwd(), 'resources/public/types'),
                declaration   : true,
                ...options.ts || {},
            },
            streamsPackages: {
                ...options.streamsPackages || {},
            },
            externals      : {},
        };


        return;
    }

    public dependencies() {return dependencies;}

    public boot() {
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
            appendTsSuffixTo: [ /\.vue$/ ],
            transpileOnly   : true,
            logLevel        : 'INFO',
            logInfoToStdOut : true,
            happyPackMode   : true, experimentalWatchApi: true,
            configFile      : this.options.ts.configFile,
            compilerOptions : {
                target        : 'es6' as any,
                module        : 'esnext' as any,
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

    getStreamPackages() {
        return findStreamPackages(this.getRootProjectPath());
    }

    public webpackConfig(config: webpack.Configuration) {
        config.devtool       = isDev ? 'inline-cheap-module-source-map' : false;
        config.resolve       = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias || {},
        };
        config.externals     = this.options.externals;

        config.experiments              = config.experiments || {};
        config.experiments.outputModule = this.options.type === 'module';

        const streamPackages = this.getStreamPackages();
        Object.values(streamPackages).forEach(streamPackage => {
            if ( false === [ 'mix', 'webpack' ].includes(streamPackage.streams.bundler) ) {
                return;
            }
            let [ prefix, name ] = streamPackage.streams.output.name;
            let packageName      = streamPackage.pkg.name;
            if ( this.options.name[ 0 ] === prefix && this.options.name[ 1 ] === name ) return;
            config.externals[ packageName ] = [ prefix, name ];
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
        // delete rule.loader;
        // delete rule.options;
        // rule.use            = [
        //     { loader: 'babel-loader', options: this.babelConfig() },
        //     { loader: 'ts-loader', options: this.tsConfig() },
        // ];
    }

    public webpackRules(): webpack.RuleSetRule | webpack.RuleSetRule[] {
        return [ {
            test   : /\.tsx?$/,
            exclude: /node_modules\//,
            use    : [
                { loader: 'babel-loader', options: this.babelConfig() },
                { loader: 'ts-loader', options: this.tsConfig() },
            ],
        } ];
    }
}
