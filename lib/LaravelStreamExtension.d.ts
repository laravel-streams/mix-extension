import { ClassComponent, Dependency } from 'laravel-mix/types/component';
import { TransformOptions } from 'babel-core';
import * as webpack from 'webpack';
export interface LaravelStreamExtensionPacakge {
    name: string;
    entry: string;
    entryName: string;
    prefix: string;
    scssRule?: webpack.RuleSetRule;
    package: any;
    path(...parts: any[]): string;
    has(...parts: any[]): boolean;
    read(...parts: any[]): string;
    write(data: any, ...parts: any[]): void;
}
export interface LaravelStreamExtensionOptions {
    packages?: Array<string>;
    outputPath?: string;
    applyOptimization?: boolean;
}
export declare class LaravelStreamExtension implements ClassComponent {
    passive: boolean;
    options: LaravelStreamExtensionOptions;
    packages: LaravelStreamExtensionPacakge[];
    name(): string | string[];
    register(options: LaravelStreamExtensionOptions): void;
    webpackEntry?(entry: any): void;
    webpackConfig(config: webpack.Configuration): void;
    boot(): void;
    dependencies(): Dependency | Dependency[];
    webpackPlugins(): webpack.WebpackPluginInstance[];
    babelConfig(): TransformOptions;
    webpackRules(): webpack.RuleSetRule | webpack.RuleSetRule[];
}
export default LaravelStreamExtension;
