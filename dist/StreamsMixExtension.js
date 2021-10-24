"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = (0, tslib_1.__importDefault)(require("laravel-mix"));
const path_1 = require("path");
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
        this.options = Object.assign(Object.assign({ combineTsLoaderWithBabel: true, alterBabelConfig: true, tsConfig: {} }, options), { ts: Object.assign({ configFile: (0, path_1.resolve)(process.cwd(), 'webpack.tsconfig.json'), declarationDir: (0, path_1.resolve)(process.cwd(), 'resources/public/types'), declaration: true }, options.ts || {}), streamsPackages: Object.assign(Object.assign({}, options.streamsPackages || {}), { 'laravel-streams': ['streams', ['core', 'api', 'ui']] }), externals: {} });
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
    webpackConfig(config) {
        config.devtool = isDev ? 'inline-cheap-module-source-map' : false;
        config.resolve = config.resolve || {};
        config.resolve.alias = Object.assign({}, config.resolve.alias || {});
        config.externals = this.options.externals;
        Object.entries(this.options.streamsPackages).forEach(([vendor, value]) => {
            let [prefix, names] = value;
            vendor = vendor.startsWith('@') ? vendor : '@' + vendor;
            for (let name of names) {
                config.externals[[vendor, name].join('/')] = [prefix, name];
            }
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
        const rule = config.module.rules.find((rule) => {
            return rule.test && rule.test && typeof rule.test.test === 'function' && rule.test.test('script.ts');
        });
        rule.use = [
            { loader: 'babel-loader', options: this.babelConfig() },
            { loader: 'ts-loader', options: this.tsConfig() },
        ];
    }
}
exports.StreamsMixExtension = StreamsMixExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyZWFtc01peEV4dGVuc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9TdHJlYW1zTWl4RXh0ZW5zaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSwyRUFBOEI7QUFFOUIsK0JBQStCO0FBSy9CLElBQUksTUFBTSxHQUFHLHFCQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDaEMsSUFBSSxLQUFLLEdBQUksQ0FBQyxxQkFBRyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBRWpDLE1BQU0sWUFBWSxHQUFHO0FBQ2pCLGlCQUFpQjtBQUNqQix5Q0FBeUM7QUFDekMsdUJBQXVCO0FBQ3ZCLGlCQUFpQjtBQUNqQixZQUFZO0FBQ1osZUFBZTtBQUNmLGFBQWE7QUFDYixnQkFBZ0I7QUFDaEIsYUFBYTtDQUNoQixDQUFDO0FBbUNGLE1BQWEsbUJBQW1CO0lBSXJCLFFBQVEsQ0FBQyxPQUFtQztRQUMvQyxJQUFJLENBQUMsT0FBTyxpQ0FDUix3QkFBd0IsRUFBRSxJQUFJLEVBQzlCLGdCQUFnQixFQUFVLElBQUksRUFDOUIsUUFBUSxFQUFrQixFQUFFLElBQ3pCLE9BQU8sS0FDVixFQUFFLGtCQUNFLFVBQVUsRUFBTSxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsdUJBQXVCLENBQUMsRUFDL0QsY0FBYyxFQUFFLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxFQUNoRSxXQUFXLEVBQUssSUFBSSxJQUNqQixPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FFdkIsZUFBZSxrQ0FDUixPQUFPLENBQUMsZUFBZSxJQUFJLEVBQUUsS0FDaEMsaUJBQWlCLEVBQUUsQ0FBRSxTQUFTLEVBQUUsQ0FBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBRSxDQUFFLEtBRTdELFNBQVMsRUFBUSxFQUFFLEdBQ3RCLENBQUM7UUFFRixPQUFPO0lBQ1gsQ0FBQztJ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