import webpack from 'webpack';


import { PackageManifest } from '@pnpm/types';

export interface PackageJson extends PackageManifest {
    streams?: StreamPackageConfig;
}

export interface StreamPackageConfigScripts {

    dev?: string | null;
    prod?: string | null;
    watch?: string | null;
    test?: string | null;
}

export type StreamPackageConfigScript = keyof StreamPackageConfigScripts;

export interface StreamPackageConfig {
    output: {
        name: [ string, string ]
        type: 'module' | 'commonjs' | 'assign'
    },
    src: string
    bundler: 'webpack' | 'mix' | 'rollup' | null,
    scripts: StreamPackageConfigScripts
}

export interface StreamPackageInfo {
    pkg: PackageJson,
    streams: StreamPackageConfig
    packagePath: string,
    composerPath?: string,
    path: string,
    composer?: any,
}
