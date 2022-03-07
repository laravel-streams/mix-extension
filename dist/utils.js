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
            // console.warn(packagePath,e);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLCtCQUE0QjtBQUM1QixxREFBb0Q7QUFDcEQsaURBQWtEO0FBRWxELHNFQUFxQztBQUNyQyxtREFBbUU7QUFHbkUsU0FBZ0Isa0JBQWtCLENBQUMsVUFBa0IsT0FBTyxDQUFDLEdBQUcsRUFBRTtJQUM5RCxNQUFNLGNBQWMsR0FBa0MsRUFBRSxDQUFDO0lBRXpELFdBQUksQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBRSxjQUFjLENBQUUsRUFBRSxDQUFDO1NBQ3pFLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUNmLElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSTtZQUNBLElBQUksSUFBSSxHQUFHLElBQUEsaUJBQVksRUFBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDN0MsR0FBRyxHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDL0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLCtCQUErQjtTQUNsQztRQUNELE9BQU87WUFDSCxHQUFHO1lBQ0gsV0FBVztTQUNkLENBQUM7SUFDTixDQUFDLENBQUM7U0FDRCxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsV0FBQyxPQUFBLENBQUEsTUFBQSxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsR0FBRywwQ0FBRSxPQUFPLE1BQUssU0FBUyxDQUFBLEVBQUEsQ0FBQztTQUM5QyxPQUFPLENBQUMsQ0FBQyxHQUFzQixFQUFFLEVBQUU7UUFDaEMsR0FBRyxDQUFDLE9BQU8sR0FBVSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUNyQyxHQUFHLENBQUMsSUFBSSxHQUFhLElBQUEsY0FBTyxFQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxNQUFNLFlBQVksR0FBRyxJQUFBLGNBQU8sRUFBQyxJQUFBLGNBQU8sRUFBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDeEUsR0FBRyxDQUFDLFlBQVksR0FBSyxJQUFBLGVBQVUsRUFBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDcEUsSUFBSyxHQUFHLENBQUMsWUFBWSxFQUFHO1lBQ3BCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUM1QztRQUNELGNBQWMsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBRSxHQUFHLElBQUksNkJBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1RCxDQUFDLENBQUMsQ0FBQztJQUdQLE9BQU8sY0FBYyxDQUFDO0FBRTFCLENBQUM7QUFoQ0QsZ0RBZ0NDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQWdCLEVBQUUsR0FBVyxFQUFFLFFBQWdCLFFBQVE7SUFDOUUsSUFBSSxPQUFPLEdBQUcsSUFBQSxjQUFPLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFBLHFCQUFVLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25ELElBQUksS0FBSyxHQUFLLENBQUMsQ0FBQztJQUNoQixJQUFJLElBQUksQ0FBQztJQUVULEdBQUc7UUFDQyxNQUFNLFFBQVEsR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFekMsSUFBSyxZQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFHO1lBQzNCLE9BQU8sUUFBUSxDQUFDO1NBQ25CO1FBRUQsS0FBSyxFQUFHLENBQUM7UUFDVCxJQUFJLEdBQU0sT0FBTyxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ25DLFFBQVMsSUFBSSxLQUFLLE9BQU8sSUFBSSxLQUFLLElBQUksS0FBSyxFQUFHO0FBQ25ELENBQUM7QUFoQkQsZ0NBZ0JDO0FBQUEsQ0FBQyJ9