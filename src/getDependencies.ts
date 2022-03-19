import { PackageJson } from './types';
import { StreamPackageManager } from './StreamPackageManager';
import { findFileUp } from './utils';
import { DependencyCollection } from './DependencyCollection';


export function getDependencies(pkg: PackageJson, manager?: StreamPackageManager) {
    let deps: Record<string, PackageJson> = {};

    Object.entries(pkg.dependencies).forEach(([ name, version ]) => {
        try {
            const resolvedPath = require.resolve(name);
            const packagePath  = findFileUp('package.json', resolvedPath);
            deps[ name ]       = require(packagePath);
        } catch (e) {
            if ( manager.packages.has(name) ) {
                deps[ name ] = manager.packages.get(name).pkg;
            }
        }
        return;
    });

    return new DependencyCollection(deps);
}
