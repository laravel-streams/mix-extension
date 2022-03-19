import { StreamPackageCollection } from './StreamPackageCollection';
import { StreamPackage } from './StreamPackage';


export interface Resolved {
    expose: string[];
    external: string[];
}

export class ExposeExternalResolver {
    protected packages: StreamPackageCollection;
    protected package: StreamPackage;
    protected resolved:Resolved;


    constructor(
        packages: StreamPackageCollection,
        currentPackage: StreamPackage,
    ) {
        this.packages = packages;
        this.package  = currentPackage;
    }

    protected reset() {
        this.resolved = {
            expose: [],
            external: []
        };
    }

    resolve() {
        this.reset();
        // depends on streampackage(s) => external streams.<name>
        this.resolved.external.push(...this.package.dependencies.streamPackages().keySeq().toArray());

        // depends on own dependencies => expose
        this.resolved.expose.push(...this.package.dependencies.withoutStreamPackages().keySeq().toArray());

        // depends on streampackages => each streampackage =>
        for ( const streamPackage of this.package.getStreamPackageDependencies(this.packages)){
            // dependencies without streampackages => remove dependency from expose and add to external
            let dependenciesWithoutStreamPackages = streamPackage.dependencies.withoutStreamPackages().keySeq().toArray();
            this.resolved.expose = this.resolved.expose.filter(name => !dependenciesWithoutStreamPackages.includes(name))
            this.resolved.external.push(...dependenciesWithoutStreamPackages)
        }

        this.resolved.external=this.resolved.external.filter(name => this.package.dependencies.has(name))
                                   .filter(name => !this.packages.has(name));

        return this.resolved;
    }
}
