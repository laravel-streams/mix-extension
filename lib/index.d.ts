import api from 'laravel-mix';
import { LaravelStreamExtension, LaravelStreamExtensionOptions } from './LaravelStreamExtension';
export { LaravelStreamExtensionOptions, };
export default LaravelStreamExtension;
declare global {
    var mix: typeof api & {
        streams(options: LaravelStreamExtensionOptions): any;
    };
}
