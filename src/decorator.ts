import {Constructor, PrefixedField} from "./types";
import {CreateIndexesOptions, IndexDirection} from "mongodb";
import {kModelIndexes} from "./constant";


export type IndexFields<T> = {
  [P in keyof T]: IndexDirection
}

export type ModelIndex<T> = {
  fields: IndexFields<Partial<T>>
  options?: CreateIndexesOptions
}


/**
 * @example
 *
 * ```typescript
 * index<User>({name: 1, age: -1"}, {unique: true})
 * index<User>(["name", "-age"], {unique: true})
 * ```
 * @param fields
 * @param options
 */
export function index<T>(fields: IndexFields<Partial<T>> | PrefixedField<T>[], options?: CreateIndexesOptions){
  return function <T extends Constructor> (klass: T) {
    const indexes = Reflect.getMetadata(kModelIndexes, klass) || []
    if (Array.isArray(fields)){
      const newFields = fields.reduce((a: {[key: string]: -1 | 1}, c) => {
        const negative = c.startsWith("-")
        a[negative ? c.substring(1) : c] = negative ? -1 : 1
        return a
      }, {})
      indexes.push({fields: newFields, options})
    } else {
      indexes.push({fields, options})
    }
    Reflect.defineMetadata(kModelIndexes, indexes, klass)
  }
}