///<reference path="modules.d.ts"/>

import { PackageJson } from './types';
import { Map } from './utils';
import { Map as IMap } from 'immutable';
import { getDependencies } from './getDependencies';


export class DependencyCollection<K extends string = string, V extends PackageJson = PackageJson> extends Map<K, V> {


    getDependenciesOf(key?: K) {
        return getDependencies(this.get(key));
    }

    withoutStreamPackages(): this {
        let all = this.toObject();
        let res = IMap(all).asMutable().filter((v, k) => ('streams' in v) === false).toObject();
        return new DependencyCollection(res) as any;
    }

    streamPackages(): this {
        let all = this.toObject();
        let res = IMap(all).asMutable().filter((v, k) => {
            let isStream = 'streams' in v;
            return isStream;
        }).toObject();
        return new DependencyCollection(res) as any;
    }
}
