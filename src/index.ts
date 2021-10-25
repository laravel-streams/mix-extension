import mix from 'laravel-mix';
import { StreamsMixExtension, StreamsMixExtensionOptions } from './StreamsMixExtension';

declare module 'laravel-mix/types/index' {
    interface Api {
        streams(options?: StreamsMixExtensionOptions): this;
    }
}

const extension = new StreamsMixExtension();
mix.extend(extension.name(), extension);

export { StreamsMixExtension, StreamsMixExtensionOptions };
export default StreamsMixExtension;

export * from './utils';
