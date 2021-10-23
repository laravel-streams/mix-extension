import { Options as TSConfig } from 'ts-loader';
export interface StreamsMixExtensionOptions {
    name: [string, string];
    ts?: {
        configFile?: string;
        declarationDir?: string;
        declaration?: boolean;
    };
    tsConfig?: Partial<TSConfig>;
    alterBabelConfig?: boolean;
    combineTsLoaderWithBabel?: boolean;
}
