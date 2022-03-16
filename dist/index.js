"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = tslib_1.__importDefault(require("laravel-mix"));
const StreamsMixExtension_1 = require("./StreamsMixExtension");
Object.defineProperty(exports, "StreamsMixExtension", { enumerable: true, get: function () { return StreamsMixExtension_1.StreamsMixExtension; } });
const extension = new StreamsMixExtension_1.StreamsMixExtension();
laravel_mix_1.default.extend(extension.name(), extension);
exports.default = StreamsMixExtension_1.StreamsMixExtension;
tslib_1.__exportStar(require("./utils"), exports);
tslib_1.__exportStar(require("./StreamPackage"), exports);
//# sourceMappingURL=index.js.map