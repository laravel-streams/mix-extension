"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = tslib_1.__importDefault(require("laravel-mix"));
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
        this.options = Object.assign(Object.assign({ combineTsLoaderWithBabel: true, alterBabelConfig: true, rootProjectFile: 'artisan', tsConfig: {}, path: (0, path_1.resolve)(process.cwd(), 'resources/public'), filename: 'js/[name].js', chunkFilename: 'js/chunk.[name].js', type: 'window' }, options), { ts: Object.assign({ configFile: (0, path_1.resolve)(process.cwd(), 'webpack.tsconfig.json'), declarationDir: (0, path_1.resolve)(process.cwd(), 'resources/public/types'), declaration: true }, options.ts || {}), streamsPackages: Object.assign({}, options.streamsPackages || {}), externals: {} });
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
                '@babel/plugin-transform-runtime',
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
        config.experiments = config.experiments || {};
        config.experiments.outputModule = this.options.type === 'module';
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
            path: this.options.path,
            filename: this.options.filename,
            chunkFilename: this.options.chunkFilename,
            library: {
                name: this.options.name,
                type: this.options.type,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyZWFtc01peEV4dGVuc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9TdHJlYW1zTWl4RXh0ZW5zaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxzRUFBOEI7QUFFOUIsK0JBQXdDO0FBSXhDLG1DQUF5RDtBQUV6RCxJQUFJLE1BQU0sR0FBRyxxQkFBRyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ2hDLElBQUksS0FBSyxHQUFJLENBQUMscUJBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUVqQyxNQUFNLFlBQVksR0FBRztBQUNqQixpQkFBaUI7QUFDakIseUNBQXlDO0FBQ3pDLHVCQUF1QjtBQUN2QixpQkFBaUI7QUFDakIsWUFBWTtBQUNaLGVBQWU7QUFDZixhQUFhO0FBQ2IsZ0JBQWdCO0FBQ2hCLGFBQWE7Q0FDaEIsQ0FBQztBQThDRixNQUFhLG1CQUFtQjtJQUlyQixRQUFRLENBQUMsT0FBbUM7UUFDL0MsSUFBSSxDQUFDLE9BQU8saUNBQ1Isd0JBQXdCLEVBQUUsSUFBSSxFQUM5QixnQkFBZ0IsRUFBVSxJQUFJLEVBQzlCLGVBQWUsRUFBVyxTQUFTLEVBQ25DLFFBQVEsRUFBa0IsRUFBRSxFQUM1QixJQUFJLEVBQXNCLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUNwRSxRQUFRLEVBQWtCLGNBQWMsRUFDeEMsYUFBYSxFQUFhLG9CQUFvQixFQUM5QyxJQUFJLEVBQXNCLFFBQVEsSUFDL0IsT0FBTyxLQUNWLEVBQUUsa0JBQ0UsVUFBVSxFQUFNLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxFQUMvRCxjQUFjLEVBQUUsSUFBQSxjQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLHdCQUF3QixDQUFDLEVBQ2hFLFdBQVcsRUFBSyxJQUFJLElBQ2pCLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFB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