import {Filter} from "mongodb";

export type Constructor<T = any> = { new(...args: any[]): T }
export type PropertyType = Function | Constructor | string | [Constructor?]

export interface NameToClassMap {
  [key: string]: Constructor
}

type NonMethodKeys<T> = {
  [K in keyof T]-?: T[K] extends Function ? never : K
}[keyof T]

export type DeepPartial<T> = {
  [P in NonMethodKeys<T>]?: T[P] extends Array<infer U> ?
    Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U> ?
      ReadonlyArray<DeepPartial<U>>
      : T[P] extends string ? string
        : T[P] extends number ? number
          : T[P] extends boolean ? boolean
            : DeepPartial<T[P]>
};

export type ModelProps<T, U = undefined> = DeepPartial<U extends undefined ? T : T | U>
export type addPrefix<TKey, TPrefix extends string> = TKey extends string ? `${TPrefix}${TKey}` : never;
export type KeyValue = {[key: string | symbol]: any}
export type Field<T> = NonMethodKeys<T>
export type PrefixedField<T> = addPrefix<NonMethodKeys<T>, "-" | "">


export type PopulateOption = {
  path: string,
  select?: string[],
  match?: Filter<any>
  options?: {
    limit?: number
    perDocLimit?: number
  },
  populate?: PopulateOption
}