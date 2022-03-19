import { StreamPackageConfig, StreamPackageInfo } from './types';
import { PackageManifest } from '@pnpm/types';
import { DependencyCollection } from './DependencyCollection';
import { StreamPackageCollection } from './StreamPackageCollection';
import { StreamPackageManager } from './StreamPackageManager';
import { getDependencies } from './getDependencies';

export class StreamPackage implements StreamPackageInfo {
    public packagePath: string;
    public pkg: PackageManifest;
    public path: string;
    public streams: StreamPackageConfig;

    public get dependencies(): DependencyCollection {
        let deps = getDependencies(this.pkg, this.manager);

        return deps;
    }

    public get vendorDependencies(): DependencyCollection {
        return this.dependencies.withoutStreamPackages();
    }

    public get streamPackageDependencies(): DependencyCollection {
        return this.dependencies.streamPackages();
    }

    constructor(info: StreamPackageInfo, protected manager: StreamPackageManager) {
        Object.assign(this, info);
    }

    public getStreamPackageDependencies(streamPackages: StreamPackageCollection): StreamPackage[] {
        return this.streamPackageDependencies.keySeq().toArray().map(name => streamPackages.get(name));
    }

}
