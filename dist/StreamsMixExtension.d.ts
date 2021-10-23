import { ClassComponent } from 'laravel-mix/types/component';
import { Options as TSConfig } from 'ts-loader';
import * as webpack from 'webpack';
import { TransformOptions } from '@babel/core';
import { StreamsMixExtensionOptions } from './StreamsMixExtensionOptions';
export declare class StreamsMixExtension implements ClassComponent {
    options: StreamsMixExtensionOptions;
    register(options: StreamsMixExtensionOptions): void;
    dependencies(): string[];
    boot(): void;
    name(): string;
    protected getBabelConfig(): TransformOptions;
    babelConfig(): TransformOptions;
    tsConfig(): Partial<TSConfig>;
    webpackConfig(config: webpack.Configuration): void;
    webpackRules(): webpack.RuleSetRule | webpack.RuleSetRule[];
}
