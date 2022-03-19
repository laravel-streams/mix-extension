import { PackageJson } from './types';
import { findFileUp } from './utils';
import { DependencyCollection } from './DependencyCollection';
import { StreamPackageManager } from './StreamPackageManager';


export function getDependencies(pkg: PackageJson, manager?:StreamPackageManager) {
    let deps: Record<string, PackageJson> = {};

    Object.entries(pkg.dependencies).forEach(([ name, version ]) => {
        try {
            const resolvedPath = require.resolve(name);
            const packagePath  = findFileUp('package.json', resolvedPath);
            deps[ name ]       = require(packagePath);
        } catch (e) {
            if(manager.packages.has(name)){
                deps[name] = manager.packages.get(name).pkg;
            }
        }
        return;
    });

    return new DependencyCollection(deps);
}

//
//
/*

streampackage
    depends on streampackage(s) => external streams.<name>
    depends on own dependencies => expose
    depends on streampackages => each streampackage => dependencies without streampackages => remove dependency from expose and add to external


 */
