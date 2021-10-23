"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = tslib_1.__importDefault(require("laravel-mix"));
const path_1 = require("path");
const typescript_1 = require("typescript");
let isProd = laravel_mix_1.default.inProduction();
let isDev = !laravel_mix_1.default.inProduction();
const dependencies = [
    "@babel/core",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/preset-env",
    "laravel-mix",
    "ts-lib",
    "ts-loader",
    "ts-node",
    "typescript",
    "webpack",
];
class StreamsMixExtension {
    register(options) {
        this.options = Object.assign(Object.assign({ combineTsLoaderWithBabel: true, alterBabelConfig: true, tsConfig: {} }, options), { ts: Object.assign({ configFile: path_1.resolve(process.cwd(), 'webpack.tsconfig.json'), declarationDir: path_1.resolve(process.cwd(), 'resources/public/types'), declaration: true }, options.ts || {}) });
    }
    dependencies() { return dependencies; }
    boot() {
        laravel_mix_1.default.options({
            terser: {
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                },
            },
        });
    }
    name() { return 'streams'; }
    getBabelConfig() {
        return {
            babelrc: false,
            configFile: false,
            compact: isProd,
            sourceMaps: isDev,
            comments: isDev,
            presets: [
                ['@babel/preset-env', {
                        'useBuiltIns': false,
                        'targets': '> 0.25%, not dead',
                    }],
            ],
            plugins: [
                '@babel/plugin-syntax-dynamic-import',
            ],
        };
    }
    babelConfig() {
        return this.options.alterBabelConfig ? this.getBabelConfig() : undefined;
    }
    tsConfig() {
        return {
            transpileOnly: true,
            logLevel: 'INFO',
            logInfoToStdOut: true,
            happyPackMode: true,
            configFile: this.options.ts.configFile,
            compilerOptions: {
                target: typescript_1.ScriptTarget.ESNext,
                module: typescript_1.ModuleKind.ESNext,
                declaration: this.options.ts.declaration,
                declarationDir: this.options.ts.declarationDir,
                importHelpers: true,
                sourceMap: isDev,
                removeComments: isProd,
                experimentalWatchApi: true,
            },
        };
    }
    ;
    webpackConfig(config) {
        config.devtool = isDev ? 'inline-cheap-module-source-map' : false;
        config.output = {
            path: path_1.resolve('./resources/public'),
            filename: 'js/[name].js',
            chunkFilename: 'js/chunk.[name].js',
            library: {
                name: this.options.name,
                type: 'window',
            },
            publicPath: `/vendor/${this.options.name[0]}/${this.options.name[1]}/`,
            devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]',
            devtoolModuleFilenameTemplate: info => {
                var $filename = 'sources://' + info.resourcePath;
                $filename = 'webpack:///' + info.resourcePath; // +'?' + info.hash;
                if (info.resourcePath.match(/\.vue$/) && !info.allLoaders.match(/type=script/) && !info.query.match(/type=script/)) {
                    $filename = 'webpack-generated:///' + info.resourcePath; // + '?' + info.hash;
                }
                return $filename;
            },
        };
        config.optimization = Object.assign(Object.assign({}, config.optimization), { moduleIds: 'named', chunkIds: 'named', minimize: isProd });
    }
    webpackRules() {
        const use = [{ loader: 'ts-loader', options: this.tsConfig() }];
        if (this.options.combineTsLoaderWithBabel) {
            use.unshift({ loader: 'babel-loader', options: this.getBabelConfig() });
        }
        return [{ test: /\.tsx?$/, exclude: /node_modules\//, use }];
    }
}
exports.StreamsMixExtension = StreamsMixExtension;
