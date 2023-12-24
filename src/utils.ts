import {Constructor, KeyValue, NameToClassMap} from "./types";
import {kDirtyFields, kNameToClassMap, kNew} from "./constant";
import {Base} from "./base";


export function getModelClass<T>(modelClassName: string): Constructor<T> {
  const nameToClassMapMetadata: NameToClassMap = Reflect.getMetadata(kNameToClassMap, Base.constructor)
return nameToClassMapMetadata[modelClassName]
}


export function withSavedModelMetadata(obj: KeyValue): any{
  obj[kDirtyFields].clear()
  obj[kNew] = false
  return obj
}