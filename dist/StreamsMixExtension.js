"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = tslib_1.__importDefault(require("laravel-mix"));
const path_1 = require("path");
const utils_1 = require("./utils");
const webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
const webpack_visualizer_plugin_1 = tslib_1.__importDefault(require("webpack-visualizer-plugin"));
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
        let entries = config.entry;
        let entryFile = this.path(this.options.entryFile);
        let name = Array.isArray(this.options.name) ? this.options.name.join('/') : this.options.name;
        let filename = Array.isArray(this.options.name) ? this.options.name[this.options.name.length - 1] : this.options.name;
        config.entry = {
            [name]: {
                import: entryFile,
                filename: `js/${filename}.js`,
                library: {
                    name: this.options.name,
                    type: this.options.type,
                },
            },
        };
        Object.entries(entries).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                config.entry[key] = value.filter(entry => entry !== entryFile);
            }
        });
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
            config.plugins.push(new webpack_visualizer_plugin_1.default({
                filename: './bundle-visualizer.html',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyZWFtc01peEV4dGVuc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9TdHJlYW1zTWl4RXh0ZW5zaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxzRUFBOEI7QUFFOUIsK0JBQXdDO0FBSXhDLG1DQUF5RDtBQUN6RCxxRUFBK0Q7QUFDL0Qsa0dBQXlEO0FBRXpELElBQUksTUFBTSxHQUFHLHFCQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDaEMsSUFBSSxLQUFLLEdBQUksQ0FBQyxxQkFBRyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBRWpDLE1BQU0sWUFBWSxHQUFHO0FBQ2pCLGlCQUFpQjtBQUNqQix5Q0FBeUM7QUFDekMsdUJBQXVCO0FBQ3ZCLGlCQUFpQjtBQUNqQixZQUFZO0FBQ1osZUFBZTtBQUNmLGFBQWE7QUFDYixnQkFBZ0I7QUFDaEIsYUFBYTtDQUNoQixDQUFDO0FBZ0RGLE1BQWEsbUJBQW1CO0lBSXJCLFFBQVEsQ0FBQyxPQUFtQztRQUMvQyxNQUFNLEdBQUcsR0FBTSxPQUFPLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxpQ0FDUix3QkFBd0IsRUFBRSxJQUFJLEVBQzlCLGdCQUFnQixFQUFVLElBQUksRUFDOUIsZUFBZSxFQUFXLFNBQVMsRUFDbkMsUUFBUSxFQUFrQixFQUFFLEVBQzVCLEdBQUcsRUFBdUIsR0FBRyxFQUM3QixPQUFPLEVBQW1CLEtBQUssRUFDL0IsU0FBUyxFQUFpQix3QkFBd0IsRUFDbEQsSUFBSSxFQUFzQixJQUFBLGNBQU8sRUFBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsRUFDMUQsUUFBUSxFQUFrQixjQUFjLEVBQ3hDLGFBQWEsRUFBYSxvQkFBb0IsRUFDOUMsSUFBSSxFQUFzQixRQUFRLElBQy9CLE9BQU8sS0FDVixFQUFFLGtCQUNFLFVBQVUsRUFBTSxJQUFBLGNBQU8sRUFBQyxHQUFHLEVBQUUsdUJBQXVCLENBQUMsRUFDckQsY0FBYyxFQUFFLElBQUEsY0FBTyxFQUFDLEdBQUcsRUFBRSx3QkFBd0IsQ0FBQyxFQUN0RCxXQUFXLEVBQUssSUFBSSxJQUNqQixPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FFdkIsZUFBZSxvQkFDUixPQUFPLENBQUMsZUFBZSxJQUFJLEVBQUUsR0FFcEMsU0FBUyxFQUFRLEVBQUUsR0FDdEIsQ0FBQztRQUdGLE9BQU87SUFDWCxDQUFDO0lBRVMsSUFBSSxDQUFDLEdBQUcsS0FBZTtRQUM3QixPQUFPLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLFlBQVksS0FBSSxPQUFPLFlBQVksQ0FBQyxDQUFBLENBQUM7SUFFckMsSUFBSTtRQUNQLHFCQUFHLENBQUMsT0FBTyxDQUFDO1lBQ1IsTUFBTSxFQUFFO2dCQUNKLGFBQWEsRUFBRTtvQkFDWCxlQUFlLEVBQUUsSUFBSTtvQkFDckIsV0FBVyxFQUFNLElBQUk7aUJBQ3hCO2FBQ0o7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sSUFBSSxLQUFJLE9BQU8sU0FBUyxDQUFDLENBQUEsQ0FBQztJQUV2QixjQUFjO1FBQ3BCLE9BQU87WUFDSCxPQUFPLEVBQUssS0FBSztZQUNqQixVQUFVLEVBQUUsS0FBSztZQUVqQixPQUFPLEVBQUssTUFBTTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUksS0FBSztZQUNqQixPQUFPLEVBQUs7Z0JBQ1IsQ0FBRSxtQkFBbUIsRUFBRTt3QkFDbkIsYUFBYSxFQUFFLEtBQUs7d0JBQ3BCLFNBQVMsRUFBTSxtQkFBbUI7cUJBQ3JDLENBQUU7YUFDTjtZQUNELE9BQU8sRUFBSztnQkFDUixxQ0FBcUM7Z0JBQ3JDLGlDQUFpQzthQUNwQztTQUNKLENBQUM7SUFDTixDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDN0UsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPO1lBQ0gsZ0JBQWdCLEVBQUUsQ0FBRSxRQUFRLENBQUU7WUFDOUIsYUFBYSxFQUFLLElBQUk7WUFDdEIsUUFBUSxFQUFVLE1BQU07WUFDeEIsZUFBZSxFQUFHLElBQUk7WUFDdEIsYUFBYSxFQUFLLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJO1lBQ2xELFVBQVUsRUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVO1lBQzVDLGVBQWUsRUFBRztnQkFDZCxNQUFNLEVBQVUsS0FBWTtnQkFDNUIsTUFBTSxFQUFVLFFBQWU7Z0JBQy9CLFdBQVcsRUFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXO2dCQUMzQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsY0FBYztnQkFDOUMsYUFBYSxFQUFHLElBQUk7Z0JBQ3BCLFNBQVMsRUFBTyxLQUFLO2dCQUNyQixjQUFjLEVBQUUsTUFBTTthQUN6QjtTQUNKLENBQUM7SUFDTixDQUFDO0lBQUEsQ0FBQztJQUVLLGtCQUFrQjtRQUNyQixNQUFNLFFBQVEsR0FBRyxJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDckUsSUFBSyxDQUFDLFFBQVEsRUFBRztZQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsaUVBQWlFLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztTQUNySDtRQUNELE9BQU8sSUFBQSxjQUFPLEVBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELGlCQUFpQjtRQUNiLE9BQU8sSUFBQSwwQkFBa0IsRUFBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFTSxhQUFhLENBQUMsTUFBNkI7UUFDOUMsTUFBTSxDQUFDLE9BQU8sR0FBUyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDeEUsTUFBTSxDQUFDLE9BQU8sR0FBUyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM1QyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUsscUJBQ2IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUNoQyxDQUFDO1FBQ0YsTUFBTSxDQUFDLFNBQVMsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUU5QyxNQUFNLENBQUMsV0FBVyxHQUFnQixNQUFNLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7UUFDakUsSUFBSSxPQUFPLEdBQXVCLE1BQU0sQ0FBQyxLQUFpQixDQUFDO1FBQzNELElBQUksU0FBUyxHQUFxQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEUsSUFBSSxJQUFJLEdBQTBCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUNySCxJQUFJLFFBQVEsR0FBc0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzNJLE1BQU0sQ0FBQyxLQUFLLEdBQXNCO1lBQzlCLENBQUUsSUFBSSxDQUFFLEVBQUU7Z0JBQ04sTUFBTSxFQUFJLFNBQVM7Z0JBQ25CLFFBQVEsRUFBRSxNQUFNLFFBQVEsS0FBSztnQkFDN0IsT0FBTyxFQUFHO29CQUNOLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7b0JBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7aUJBQ25CO2FBQ1g7U0FDSixDQUFDO1FBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLEdBQUcsRUFBRSxLQUFLLENBQUUsRUFBRSxFQUFFO1lBQy9DLElBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRztnQkFDeEIsTUFBTSxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDO2FBQ3BFO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFHSCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNoRCxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNsRCxJQUFLLEtBQUssS0FBSyxDQUFFLEtBQUssRUFBRSxTQUFTLENBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRztnQkFDMUUsT0FBTzthQUNWO1lBQ0QsSUFBSSxDQUFFLE1BQU0sRUFBRSxJQUFJLENBQUUsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDekQsSUFBSSxXQUFXLEdBQVEsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDOUMsSUFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUUsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFFLEtBQUssSUFBSTtnQkFBRyxPQUFPO1lBQ25GLE1BQU0sQ0FBQyxTQUFTLENBQUUsV0FBVyxDQUFFLEdBQUcsQ0FBRSxNQUFNLEVBQUUsSUFBSSxDQUFFLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFHSCxNQUFNLENBQUMsTUFBTSxHQUFTO1lBQ2xCLElBQUksRUFBbUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQ3hELFFBQVEsRUFBK0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRO1lBQzVELGFBQWEsRUFBMEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhO1lBQ2pFLE9BQU8sRUFBZ0M7Z0JBQ25DLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7Z0JBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxRQUFRO2FBQ3RDO1lBQ0QsVUFBVSxFQUE2QixXQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHO1lBQ3JHLHFDQUFxQyxFQUFFLG1DQUFtQztZQUMxRSw2QkFBNkIsRUFBVSxJQUFJLENBQUMsRUFBRTtnQkFDMUMsSUFBSSxTQUFTLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ2pELFNBQVMsR0FBTyxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLG9CQUFvQjtnQkFDdkUsSUFBSyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUc7b0JBQ2xILFNBQVMsR0FBRyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMscUJBQXFCO2lCQUNqRjtnQkFDRCxPQUFPLFNBQVMsQ0FBQztZQUNyQixDQUFDO1NBQ0osQ0FBQztRQUNGLE1BQU0sQ0FBQyxZQUFZLG1DQUNaLE1BQU0sQ0FBQyxZQUFZLEtBQ3RCLFNBQVMsRUFBRSxPQUFPLEVBQ2xCLFFBQVEsRUFBRyxPQUFPLEVBQ2xCLFFBQVEsRUFBRyxNQUFNLEdBQ3BCLENBQUM7UUFFRixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUF5QixFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztRQUM5SixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBR3pDLElBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUc7WUFDeEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSw4Q0FBb0IsQ0FBQztnQkFDekMsWUFBWSxFQUFJLFFBQVE7Z0JBQ3hCLGNBQWMsRUFBRSx3QkFBd0I7Z0JBQ3hDLFlBQVksRUFBSSxNQUFNO2FBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBZ0IsQ0FBQztnQkFFckMsUUFBUSxFQUFFLDBCQUEwQjthQUN2QyxDQUFDLENBQUMsQ0FBQztTQUNQO0lBRUwsQ0FBQztJQUdNLFlBQVk7UUFDZixPQUFPLENBQUU7Z0JBQ0wsSUFBSSxFQUFLLFNBQVM7Z0JBQ2xCLE9BQU8sRUFBRSxnQkFBZ0I7Z0JBQ3pCLEdBQUcsRUFBTTtvQkFDTCxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDdkQsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7aUJBQ3BEO2FBQ0osQ0FBRSxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBak5ELGtEQWlOQyJ9