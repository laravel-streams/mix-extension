import mix from 'laravel-mix';
import { ClassComponent } from 'laravel-mix/types/component';
import { resolve } from 'path';
import { Options as TSConfig } from 'ts-loader';
import * as webpack from 'webpack';
import { TransformOptions } from '@babel/core';

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
export type PackageVendor = string
/** The exported library name prefix like 'streams' */
export type PackageNamespacePrefix = string
/** The exported library name like 'api' */
export type PackageNamespaceName = string

export interface StreamsMixExtensionOptions {
    name: [ string, string ];
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
    streamsPackages?: Record<PackageVendor, [ PackageNamespacePrefix, PackageNamespaceName[] ]>;
    /**
     * If the {@see StreamsMixExtensionOptions.streamsPackages} doesn't comply with your wishes, then do it yourself:
     */
    externals?: Record<string, string>;
}


export class StreamsMixExtension implements ClassComponent {

    options: StreamsMixExtensionOptions;

    public register(options: StreamsMixExtensionOptions) {
        this.options = {
            combineTsLoaderWithBabel: true,
            alterBabelConfig        : true,
            tsConfig                : {},
            ...options,
            ts             : {
                configFile    : resolve(process.cwd(), 'webpack.tsconfig.json'),
                declarationDir: resolve(process.cwd(), 'resources/public/types'),
                declaration   : true,
                ...options.ts || {},
            },
            streamsPackages: {
                ...options.streamsPackages || {},
                'laravel-streams': [ 'streams', [ 'core', 'api', 'ui' ] ],
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
            ],
        };
    }

    public babelConfig(): TransformOptions {
        return this.options.alterBabelConfig ? this.getBabelConfig() : undefined;
    }

    public tsConfig(): Partial<TSConfig> {
        return {
            transpileOnly  : true,
            logLevel       : 'INFO',
            logInfoToStdOut: true,
            happyPackMode  : true, experimentalWatchApi: true,
            configFile     : this.options.ts.configFile,
            compilerOptions: {
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

    public webpackConfig(config: webpack.Configuration) {
        config.devtool       = isDev ? 'inline-cheap-module-source-map' : false;
        config.resolve       = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias || {},
        };
        config.externals     = this.options.externals;

        Object.entries(this.options.streamsPackages).forEach(([ vendor, value ]: [ PackageVendor, [ PackageNamespacePrefix, PackageNamespaceName[] ] ]) => {
            let [ prefix, names ] = value;
            vendor                = vendor.startsWith('@') ? vendor : '@' + vendor;

            for ( let name of names ) {
                config.externals[ [ vendor, name ].join('/') ] = [ prefix, name ];
            }
        });


        config.output       = {
            path                                 : resolve('./resources/public'),
            filename                             : 'js/[name].js',
            chunkFilename                        : 'js/chunk.[name].js',
            library                              : {
                name: this.options.name,
                type: 'window',
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
        const rule = config.module.rules.find((rule:webpack.RuleSetRule) => {
            return rule.test && rule.test && typeof (rule.test as RegExp).test === 'function' && (rule.test as RegExp).test('script.ts')
        }) as webpack.RuleSetRule
        rule.use = [
            { loader: 'babel-loader', options: this.babelConfig() },
            { loader: 'ts-loader', options: this.tsConfig() },
        ]
    }

}
