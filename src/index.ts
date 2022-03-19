///<reference path="modules.d.ts"/>

import mix from 'laravel-mix';
import { StreamsMixExtension } from './StreamsMixExtension';
import { StreamsMixExtensionOptions } from './types';

declare module 'laravel-mix/types/index' {
    interface Api {
        streams(options?: StreamsMixExtensionOptions): this;
    }
}

const extension = new StreamsMixExtension();
mix.extend(extension.name(), extension);

export { StreamsMixExtension, StreamsMixExtensionOptions };
export default StreamsMixExtension;

export * from './types';
