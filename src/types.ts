import webpack from 'webpack';


import { PackageManifest } from '@pnpm/types';
import { Options as TSConfig } from 'ts-loader';

export interface PackageJson extends PackageManifest {
    streams?: StreamPackageConfig
}

export interface StreamPackageConfigScripts {

    dev?: string | null;
    prod?: string | null;
    watch?: string | null;
    test?: string | null;
}

export interface StreamPackageConfig {
    output: {
        name: [ string, string ]
    }
}

export interface StreamPackageInfo {
    pkg: PackageJson,
    streams: StreamPackageConfig
    packagePath: string,
    composerPath?: string,
    path: string,
    composer?: any,
}



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
