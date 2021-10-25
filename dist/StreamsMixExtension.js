"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = (0, tslib_1.__importDefault)(require("laravel-mix"));
const path_1 = require("path");
const utils_1 = require("./utils");
let isProd = laravel_mix_1.default.inProduction();
let isDev = !laravel_mix_1.default.inProduction();
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
class StreamsMixExtension {
    register(options) {
        this.options = Object.assign(Object.assign({ combineTsLoaderWithBabel: true, alterBabelConfig: true, rootProjectFile: 'artisan', tsConfig: {} }, options), { ts: Object.assign({ configFile: (0, path_1.resolve)(process.cwd(), 'webpack.tsconfig.json'), declarationDir: (0, path_1.resolve)(process.cwd(), 'resources/public/types'), declaration: true }, options.ts || {}), streamsPackages: Object.assign({}, options.streamsPackages || {}), externals: {} });
        return;
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
                "@babel/plugin-transform-runtime"
            ],
        };
    }
    babelConfig() {
        return this.options.alterBabelConfig ? this.getBabelConfig() : undefined;
    }
    tsConfig() {
        return {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true,
            logLevel: 'INFO',
            logInfoToStdOut: true,
            happyPackMode: true, experimentalWatchApi: true,
            configFile: this.options.ts.configFile,
            compilerOptions: {
                target: 'es6',
                module: 'esnext',
                declaration: this.options.ts.declaration,
                declarationDir: this.options.ts.declarationDir,
                importHelpers: true,
                sourceMap: isDev,
                removeComments: isProd,
            },
        };
    }
    ;
    getRootProjectPath() {
        const filePath = (0, utils_1.findFileUp)(this.options.rootProjectFile, __dirname);
        if (!filePath) {
            throw new Error(`could not find root project path based on searching for file "${this.options.rootProjectFile}"`);
        }
        return (0, path_1.dirname)(filePath);
    }
    getStreamPackages() {
        return (0, utils_1.findStreamPackages)(this.getRootProjectPath());
    }
    webpackConfig(config) {
        config.devtool = isDev ? 'inline-cheap-module-source-map' : false;
        config.resolve = config.resolve || {};
        config.resolve.alias = Object.assign({}, config.resolve.alias || {});
        config.externals = this.options.externals;
        const streamPackages = this.getStreamPackages();
        Object.values(streamPackages).forEach(streamPackage => {
            if (false === ['mix', 'webpack'].includes(streamPackage.streams.bundler)) {
                return;
            }
            let [prefix, name] = streamPackage.streams.output.name;
            let packageName = streamPackage.pkg.name;
            if (this.options.name[0] === prefix && this.options.name[1] === name)
                return;
            config.externals[packageName] = [prefix, name];
        });
        config.output = {
            path: (0, path_1.resolve)('./resources/public'),
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
        const ruleIndex = config.module.rules.findIndex((rule) => typeof rule.loader === 'string' && rule.loader.endsWith('ts-loader/index.js'));
        config.module.rules.splice(ruleIndex, 1);
        // delete rule.loader;
        // delete rule.options;
        // rule.use            = [
        //     { loader: 'babel-loader', options: this.babelConfig() },
        //     { loader: 'ts-loader', options: this.tsConfig() },
        // ];
    }
    webpackRules() {
        return [{
                test: /\.tsx?$/,
                exclude: /node_modules\//,
                use: [
                    { loader: 'babel-loader', options: this.babelConfig() },
                    { loader: 'ts-loader', options: this.tsConfig() },
                ],
            }];
    }
}
exports.StreamsMixExtension = StreamsMixExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyZWFtc01peEV4dGVuc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9TdHJlYW1zTWl4RXh0ZW5zaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSwyRUFBOEI7QUFFOUIsK0JBQXdDO0FBSXhDLG1DQUF5RDtBQUV6RCxJQUFJLE1BQU0sR0FBRyxxQkFBRyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ2hDLElBQUksS0FBSyxHQUFJLENBQUMscUJBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUVqQyxNQUFNLFlBQVksR0FBRztBQUNqQixpQkFBaUI7QUFDakIseUNBQXlDO0FBQ3pDLHVCQUF1QjtBQUN2QixpQkFBaUI7QUFDakIsWUFBWTtBQUNaLGVBQWU7QUFDZixhQUFhO0FBQ2IsZ0JBQWdCO0FBQ2hCLGFBQWE7Q0FDaEIsQ0FBQztBQTBDRixNQUFhLG1CQUFtQjtJQUlyQixRQUFRLENBQUMsT0FBbUM7UUFDL0MsSUFBSSxDQUFDLE9BQU8saUNBQ1Isd0JBQXdCLEVBQUUsSUFBSSxFQUM5QixnQkFBZ0IsRUFBVSxJQUFJLEVBQzlCLGVBQWUsRUFBVyxTQUFTLEVBQ25DLFFBQVEsRUFBa0IsRUFBRSxJQUN6QixPQUFPLEtBQ1YsRUFBRSxrQkFDRSxVQUFVLEVBQU0sSUFBQSxjQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLHVCQUF1QixDQUFDLEVBQy9ELGNBQWMsRUFBRSxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFDaEUsV0FBVyxFQUFLLElBQUksSUFDakIsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBRXZCLGVBQWUsb0JBQ1IsT0FBTyxDQUFDLGVBQWUsSUFBSSxFQUFFLEdBRXBDLFNBQVMsRUFBUSxFQUFFLEdBQ3RCLENBQUM7UUFHRixPQUFPO0lBQ1gsQ0FBQztJQUVNLFlBQVksS0FBSSxPQUFPLFlBQVksQ0FBQyxDQUFBLENBQUM7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