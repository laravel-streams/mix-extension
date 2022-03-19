import { StreamPackageCollection } from './StreamPackageCollection';
import { StreamPackage } from './StreamPackage';


export interface Resolved {
    expose: string[];
    external: string[];
}

let resolved: Record<string, Resolved> = {
    '@laravel-streams/ui' : {
        expose  : [ 'camelcase', 'collect.js', 'deepmerge', 'tapable', 'axios', 'debug', 'eventemitter2', 'inversify', 'csx', 'inversify-inject-decorators', 'lz-string', '@microsoft/fast-element', '@microsoft/fast-foundation', 'reflect-metadata', 'classnames', 'typestyle', 'csstips', 'mousetrap', 'object-observer' ],
        external: [],
    },
    '@laravel-streams/api': {
        expose  : [ '@laravel-streams/api-client' ],
        external: [ '@laravel-streams/ui', 'camelcase', 'collect.js', 'deepmerge', 'tapable', 'lz-string', 'axios', 'reflect-metadata' ],
    },
};


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

    protected getResolved(pkg: StreamPackage) {
        return this.resolved[ pkg.pkg.name ] = this.resolved[ pkg.pkg.name ] || { expose: [], external: [] };
    }

    protected expose(pkg: StreamPackage, expose: string[]) {
        this.getResolved(pkg).expose.push(...expose);
        return this;
    }

    protected external(pkg: StreamPackage, external: string[]) {
        this.getResolved(pkg).external.push(...external);
        return this;
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


/*

streampackage
    depends on streampackage(s) => external streams.<name>
    depends on own dependencies => expose
    depends on streampackages => each streampackage => dependencies without streampackages => remove dependency from expose and add to external


 */
