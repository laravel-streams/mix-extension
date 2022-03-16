"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = tslib_1.__importDefault(require("laravel-mix"));
const path_1 = require("path");
const utils_1 = require("./utils");
const webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
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
        const cwd = options.cwd || process.cwd();
        this.options = Object.assign(Object.assign({ combineTsLoaderWithBabel: true, alterBabelConfig: true, rootProjectFile: 'artisan', tsConfig: {}, cwd: cwd, analyse: false, entryFile: 'resources/lib/index.ts', path: (0, path_1.resolve)(cwd, 'resources/public'), filename: 'js/[name].js', chunkFilename: 'js/chunk.[name].js', type: 'window' }, options), { ts: Object.assign({ configFile: (0, path_1.resolve)(cwd, 'webpack.tsconfig.json'), declarationDir: (0, path_1.resolve)(cwd, 'resources/public/types'), declaration: true }, options.ts || {}), streamsPackages: Object.assign({}, options.streamsPackages || {}), externals: {} });
        return;
    }
    path(...parts) {
        return (0, path_1.resolve)(this.options.cwd, ...parts);
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
            happyPackMode: true,
            experimentalWatchApi: true,
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
        let entries = config.entry;
        let entryFile = this.path(this.options.entryFile);
        let name = Array.isArray(this.options.name) ? this.options.name.join('/') : this.options.name;
        let filename = Array.isArray(this.options.name) ? this.options.name[this.options.name.length - 1] : this.options.name;
        Object.entries(entries).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                config.entry[key] = value.filter(entry => entry !== entryFile);
            }
        });
        config.entry[name] = {
            import: entryFile,
            filename: `js/${filename}.js`,
            library: {
                name: this.options.name,
                type: this.options.type,
            },
        };
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
                type: this.options.type || 'assign',
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
        if (this.options.analyse) {
            config.plugins.push(new webpack_bundle_analyzer_1.BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: './bundle-analyzer.html',
                defaultSizes: 'gzip',
            }));
        }
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
//# sourceMappingURL=StreamsMixExtension.js.map