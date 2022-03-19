
import { Map } from './utils';
import { StreamPackage } from './StreamPackage';
import { Map as IMap } from 'immutable';


export class StreamPackageCollection<K extends string = string, V extends StreamPackage = StreamPackage> extends Map<K, V> {


    without(pkg:V):this{
        let res = IMap<K,V>(this.toObject()).asMutable().filter((v,k)=> v.pkg.name === pkg.pkg.name).toObject()
        return new StreamPackageCollection(res) as any;
    }

}
