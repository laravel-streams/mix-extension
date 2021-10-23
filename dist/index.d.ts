import { StreamsMixExtension } from './StreamsMixExtension';
import { StreamsMixExtensionOptions } from './StreamsMixExtensionOptions';
declare module 'laravel-mix/types/index' {
    interface Api {
        streams(options?: StreamsMixExtensionOptions): this;
    }
}
export { StreamsMixExtension, StreamsMixExtensionOptions };
export default StreamsMixExtension;
