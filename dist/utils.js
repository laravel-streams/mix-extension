"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFileUp = exports.findStreamPackages = void 0;
const tslib_1 = require("tslib");
const glob_1 = require("glob");
const path_1 = tslib_1.__importStar(require("path"));
const fs_1 = tslib_1.__importStar(require("fs"));
const resolve_dir_1 = tslib_1.__importDefault(require("resolve-dir"));
const StreamPackage_1 = require("./StreamPackage");
function findStreamPackages(rootDir = process.cwd()) {
    const streamPackages = {};
    glob_1.glob.sync((0, path_1.resolve)(rootDir, '**/package.json'), { ignore: ['node_modules'] })
        .map(packagePath => {
        let pkg;
        try {
            let json = (0, fs_1.readFileSync)(packagePath, 'utf8');
            pkg = JSON.parse(json);
        }
        catch (e) {
            console.warn(packagePath, e);
        }
        return {
            pkg,
            packagePath,
        };
    })
        .filter(obj => { var _a; return ((_a = obj === null || obj === void 0 ? void 0 : obj.pkg) === null || _a === void 0 ? void 0 : _a.streams) !== undefined; })
        .forEach((obj) => {
        obj.streams = obj.pkg.streams;
        obj.path = (0, path_1.dirname)(obj.packagePath);
        const composerPath = (0, path_1.resolve)((0, path_1.dirname)(obj.packagePath), 'composer.json');
        obj.composerPath = (0, fs_1.existsSync)(composerPath) ? composerPath : null;
        if (obj.composerPath) {
            obj.composer = require(obj.composerPath);
        }
        streamPackages[obj.pkg.name] = new StreamPackage_1.StreamPackage(obj);
    });
    return streamPackages;
}
exports.findStreamPackages = findStreamPackages;
function findFileUp(filename, cwd, limit = Infinity) {
    let dirname = (0, path_1.resolve)(cwd ? (0, resolve_dir_1.default)(cwd) : '.');
    let depth = 0;
    let prev;
    do {
        const filepath = (0, path_1.join)(dirname, filename);
        if (fs_1.default.existsSync(filepath)) {
            return filepath;
        }
        depth++;
        prev = dirname;
        dirname = path_1.default.dirname(dirname);
    } while (prev !== dirname && depth <= limit);
}
exports.findFileUp = findFileUp;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLCtCQUE0QjtBQUM1QixxREFBb0Q7QUFDcEQsaURBQWtEO0FBRWxELHNFQUFxQztBQUNyQyxtREFBbUU7QUFHbkUsU0FBZ0Isa0JBQWtCLENBQUMsVUFBa0IsT0FBTyxDQUFDLEdBQUcsRUFBRTtJQUM5RCxNQUFNLGNBQWMsR0FBa0MsRUFBRSxDQUFDO0lBRXpELFdBQUksQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBRSxjQUFjLENBQUUsRUFBRSxDQUFDO1NBQ3pFLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUNmLElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSTtZQUNBLElBQUksSUFBSSxHQUFHLElBQUEsaUJBQVksRUFBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDN0MsR0FBRyxHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDL0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsT0FBTztZQUNILEdBQUc7WUFDSCxXQUFXO1NBQ2QsQ0FBQztJQUNOLENBQUMsQ0FBQztTQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxXQUFDLE9BQUEsQ0FBQSxNQUFBLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxHQUFHLDBDQUFFLE9BQU8sTUFBSyxTQUFTLENBQUEsRUFBQSxDQUFDO1NBQzlDLE9BQU8sQ0FBQyxDQUFDLEdBQXNCLEVBQUUsRUFBRTtRQUNoQyxHQUFHLENBQUMsT0FBTyxHQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxJQUFJLEdBQWEsSUFBQSxjQUFPLEVBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sWUFBWSxHQUFHLElBQUEsY0FBTyxFQUFDLElBQUEsY0FBTyxFQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN4RSxHQUFHLENBQUMsWUFBWSxHQUFLLElBQUEsZUFBVSxFQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNwRSxJQUFLLEdBQUcsQ0FBQyxZQUFZLEVBQUc7WUFDcEIsR0FBRyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsY0FBYyxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLEdBQUcsSUFBSSw2QkFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVELENBQUMsQ0FBQyxDQUFDO0lBR1AsT0FBTyxjQUFjLENBQUM7QUFFMUIsQ0FBQztBQWhDRCxnREFnQ0M7QUFFRCxTQUFnQixVQUFVLENBQUMsUUFBZ0IsRUFBRSxHQUFXLEVBQUUsUUFBZ0IsUUFBUTtJQUM5RSxJQUFJLE9BQU8sR0FBRyxJQUFBLGNBQU8sRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUEscUJBQVUsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkQsSUFBSSxLQUFLLEdBQUssQ0FBQyxDQUFDO0lBQ2hCLElBQUksSUFBSSxDQUFDO0lBRVQsR0FBRztRQUNDLE1BQU0sUUFBUSxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV6QyxJQUFLLFlBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUc7WUFDM0IsT0FBTyxRQUFRLENBQUM7U0FDbkI7UUFFRCxLQUFLLEVBQUcsQ0FBQztRQUNULElBQUksR0FBTSxPQUFPLENBQUM7UUFDbEIsT0FBTyxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDbkMsUUFBUyxJQUFJLEtBQUssT0FBTyxJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUc7QUFDbkQsQ0FBQztBQWhCRCxnQ0FnQkM7QUFBQSxDQUFDIn0=