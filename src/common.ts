
export type Constructor<T = any> = { new(...args: any[]): T }
export type PropertyType = Function | Constructor | string | [Constructor]

export interface NameToClassMap {
  [key: string]: Constructor
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ?
    Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U> ?
      ReadonlyArray<DeepPartial<U>> : DeepPartial<T[P]>
};

export type ModelProps<T, U = undefined> = DeepPartial<U extends undefined ? T : T | U>
export type addPrefix<TKey, TPrefix extends string> = TKey extends string ? `${TPrefix}${TKey}` : never;
export type KeyValue = {[key: string | symbol]: any}
export type Field<T> = keyof T


export class ModelMeta {

  constructor(
    public readonly collectionName: string,
    public readonly modelClassName: string,
  ) {}

}
