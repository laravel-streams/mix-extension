# Laravel Streams Mix Extension

Laravel Streams JS packages all use similar mix configurations.

This extension prevents the need to setup each `webpack.mis.js` file separately with some defaults.

## Installation
```bash
# NPM
npm install --dev @laravel-streams/mix-extension
# YARN
yarn add -D @laravel-streams/mix-extension
```

## Usage
- Simply `require` the `@laravel-streams/mix-extension` right after `require`'ing `mix;
- Add `streams` to the mix!
-
```js
const mix = require('laravel-mix')
require('@laravel-streams/mix-extension')

mix
    .js('resources/js/index.js', 'js')
    .sass('resources/scss/index.scss', 'css')
    .streams({
        name: ['<yourvendorname>', '<yourpackagename>'],
        // for example
        name: ['streams', 'api'],
    })
```

## Configuration

```ts
interface StreamsMixExtensionOptions {
    name: [ string, string ];
    ts?: {
        configFile?: string
        declarationDir?: string
        declaration?: boolean
    };
    tsConfig?: Partial<TSConfig>;
    alterBabelConfig?: boolean;
    combineTsLoaderWithBabel?: boolean;
}
```
