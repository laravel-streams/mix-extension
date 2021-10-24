"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsMixExtension = void 0;
const tslib_1 = require("tslib");
const laravel_mix_1 = (0, tslib_1.__importDefault)(require("laravel-mix"));
const StreamsMixExtension_1 = require("./StreamsMixExtension");
Object.defineProperty(exports, "StreamsMixExtension", { enumerable: true, get: function () { return StreamsMixExtension_1.StreamsMixExtension; } });
const extension = new StreamsMixExtension_1.StreamsMixExtension();
laravel_mix_1.default.extend(extension.name(), extension);
exports.default = StreamsMixExtension_1.StreamsMixExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLDJFQUE4QjtBQUM5QiwrREFBd0Y7QUFXL0Usb0dBWEEseUNBQW1CLE9BV0E7QUFINUIsTUFBTSxTQUFTLEdBQUcsSUFBSSx5Q0FBbUIsRUFBRSxDQUFDO0FBQzVDLHFCQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUd4QyxrQkFBZSx5Q0FBbUIsQ0FBQyJ9