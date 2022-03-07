/// <reference types="node" />
export interface StreamPackageConfigScripts {
    dev?: string | null;
    prod?: string | null;
    watch?: string | null;
    test?: string | null;
}
export declare type StreamPackageConfigScript = keyof StreamPackageConfigScripts;
export interface StreamPackageConfig {
    output: {
        name: [string, string];
        type: 'module' | 'commonjs' | 'assign';
    };
    src: string;
    bundler: 'webpack' | 'mix' | 'rollup' | null;
    scripts: StreamPackageConfigScripts;
}
export interface StreamPackageInfo {
    pkg: any;
    streams: StreamPackageConfig;
    packagePath: string;
    composerPath?: string;
    path: string;
    composer?: any;
}
export declare class StreamPackage implements StreamPackageInfo {
    static scripts: StreamPackageConfigScript[];
    static manager: 'yarn' | 'pnpm' | 'npm';
    packagePath: string;
    pkg: any;
    streams: StreamPackageConfig;
    path: string;
    constructor(info: StreamPackageInfo);
    isBundler(name?: StreamPackageConfig['bundler']): boolean;
    hasScript(name: StreamPackageConfigScript): boolean;
    runScript(name: StreamPackageConfigScript): void | {
        proc: import("child_process").ChildProcess;
        events: Promise<unknown>;
    };
}
