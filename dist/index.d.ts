import { StreamsMixExtension, StreamsMixExtensionOptions } from './StreamsMixExtension';
declare module 'laravel-mix/types/index' {
    interface Api {
        streams(options?: StreamsMixExtensionOptions): this;
    }
}
export { StreamsMixExtension, StreamsMixExtensionOptions };
export default StreamsMixExtension;
export * from './utils';
export * from './StreamPackage';
