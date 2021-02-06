# Laravel Streams Mix Extension

Package name: `@laravel-streams/mix-extension`

## Usage
Simply `require` the package after `laravel-mix`. This will add a new mix function named `streams`:
```js
const mix = require('laravel-mix')
require('@laravel-streams/mix-extension')

mix.streams({

    })
```

You can provide the following options:

```typescript
export interface LaravelStreamsExtensionOptions {
    /**
    * A list of composer package names, which will be added into the streams mix build
    * @default []
    */
    packages?: Array<string>
    /**
    * The output path, relative to Laravel's public directory
    * @default 'vendor'
    */
    outputPath?: string
}
```
