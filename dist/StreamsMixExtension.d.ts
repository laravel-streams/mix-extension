import { ComponentInterface } from 'laravel-mix/types/component';
import { Options as TSConfig } from 'ts-loader';
import * as webpack from 'webpack';
import { TransformOptions } from '@babel/core';
/** npm package vendor name, excluding the @ sign. like `laravel-streams` */
export declare type PackageName = string;
/** The exported library name prefix like 'streams' */
export declare type PackageNamespacePrefix = string;
/** The exported library name like 'api' */
export declare type PackageNamespaceName = string;
export interface StreamsMixExtensionOptions {
    ts?: {
        configFile?: string;
        declarationDir?: string;
        declaration?: boolean;
    };
    tsConfig?: Partial<TSConfig>;
    alterBabelConfig?: boolean;
    combineTsLoaderWithBabel?: boolean;
    analyse?: boolean;
    cwd?: string;
    /**
     * Will result into :
     * ```ts
     * // config.externals['@' + PackageVendor + '/' + PackageNamespacePrefix] = [PackageNamespacePrefix,PackageNamespaceName]
     * config.externals['@laravel-streams/api'] = ['streams','api']
     * ```
     */
    streamsPackages?: Record<PackageName, [PackageNamespacePrefix, PackageNamespaceName[]]>;
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
    entryFile?: string;
    filename?: string;
    chunkFilename?: string;
    path?: string;
    name: [string, string] | undefined;
    type: 'var' | 'module' | 'assign' | 'assign-properties' | 'this' | 'window' | 'self' | 'global' | 'commonjs' | 'commonjs2' | 'commonjs-module' | 'amd' | 'amd-require' | 'umd' | 'umd2' | 'jsonp' | 'system';
}
export declare class StreamsMixExtension implements ComponentInterface {
    options: StreamsMixExtensionOptions;
    register(options: StreamsMixExtensionOptions): void;
    protected path(...parts: string[]): string;
    dependencies(): any[];
    boot(): void;
    name(): string;
    protected getBabelConfig(): TransformOptions;
    babelConfig(): TransformOptions;
    tsConfig(): Partial<TSConfig>;
    getRootProjectPath(): string;
    getStreamPackages(): Record<string, import("./StreamPackage").StreamPackage>;
    webpackConfig(config: webpack.Configuration): void;
    webpackRules(): webpack.RuleSetRule | webpack.RuleSetRule[];
}
