import {PropertyType} from "./common";
import {kDirtyFields, kFieldPropertiesMeta, kModelIndexes} from "./constant";
import {ObjectId} from "mongodb";

export const Ref = class Ref {}
export type Ref<T> = T | ObjectId | string

export class FieldOptions {
  type?: PropertyType
  default?: Function | any
  unique?: boolean = false
  index?: boolean = false
  _id?: boolean = true
  name?: string
}

export interface PropertiesMeta {
  [key: string]: {
    isArray: boolean
    options: FieldOptions
    isRef: boolean
  }
}

export function field(options?: FieldOptions){
  return function (target: any, propertyKey: string) {
    let isArray = false
    if (options && Array.isArray(options.type)){
      options.type = options.type[0]
      isArray = true
    }
    const _options = Object.assign(new FieldOptions(), options || {})

    const metadata: PropertiesMeta = Reflect.getMetadata(kFieldPropertiesMeta, target) || {}
    let _type = Reflect.getMetadata("design:type", target, propertyKey);
    metadata[propertyKey] = {
      isArray,
      isRef: _type == Ref,
      options: _options,
    }
    Reflect.defineMetadata(kFieldPropertiesMeta, metadata, target)

    if (_options.unique || _options.index){
      const indexes = Reflect.getMetadata(kModelIndexes, target.constructor) || []
      indexes.push({fields: {[propertyKey]: 1}, options: {unique: _options.unique}})
      Reflect.defineMetadata(kModelIndexes, indexes, target.constructor)
    }
  }
}