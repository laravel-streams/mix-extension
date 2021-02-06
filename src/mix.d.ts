import {Api} from 'laravel-mix'
import { LaravelStreamExtensionOptions } from './LaravelStreamExtension';
declare const a:mix.Api
declare module 'laravel-mix' {
    namespace mix {
        interface Api {
            streams(options:LaravelStreamExtensionOptions)
        }
    }
}
