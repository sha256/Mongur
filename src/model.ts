import {kClassName, kDirtyFields, kFieldPropertiesMeta, kNameToClassMap, kNew} from "./constant";
import type {KeyValue, Constructor, Field} from "./types";
import {ModelProps, NameToClassMap} from "./types";
import {Base} from "./base";
import {index, ModelIndex} from "./decorator";
import {PropertiesMeta} from "./field";
import {Connection, connection as defaultConnection, ModelMeta} from "./connection";
import {BulkOp, BulkOpBuilder, BulkWrite} from "./query/bulk.write";
import {AggregateOptions, DeleteResult, Filter, InsertOneOptions, ObjectId} from "mongodb";
import {FindOptions, FindQuery} from "./query/find";
import {getModelClass, withSavedModelMetadata} from "./utils";


export abstract class Factory<T, V> {
  abstract parse(input?: T): V
  abstract value(input: V): T
}

function defineModelProperty(target: any, key: string, value: any) {
  target[key] = value
}

function init(_this: KeyValue, payload: KeyValue = {}, hasId: boolean = true, isNew: boolean = true): any {
  const fieldProperties: PropertiesMeta = Reflect.getMetadata(kFieldPropertiesMeta, _this.constructor) || {}
  const nonFieldProperties = Object.keys(payload).reduce((acc, key) => key in fieldProperties ? acc : [...acc, key], [] as string[])

  _this[kNew] = isNew

  for(const key of nonFieldProperties){
    const desc = Object.getOwnPropertyDescriptor(_this, key)
    if((!desc || desc.writable || typeof desc.set === 'function')){
      _this[key] = payload[key]
    }
  }

  if (hasId){
    const value = payload["_id"]
    if (typeof value == "string"){
      defineModelProperty(_this, "_id", new ObjectId(value))
    } else if (!value){
      defineModelProperty(_this, "_id", new ObjectId())
    }
  }

  for(const key in fieldProperties){
    let { isArray, options, isRef } = fieldProperties[key]
    const payloadKey = options.name || key
    let modelClass = options.type

    const value = payload[payloadKey] || (typeof options.default == "function" ? options.default() : options.default)

    if (!modelClass || !value || isRef){
      defineModelProperty(_this, key, value)
      continue
    }

    const NameToClassMapMetadata: NameToClassMap = Reflect.getMetadata(kNameToClassMap, Base.constructor)

    if (typeof modelClass === 'string'){
      modelClass = NameToClassMapMetadata[modelClass]
    } else if ((modelClass as Constructor).prototype instanceof Base){
      modelClass = NameToClassMapMetadata[Reflect.getMetadata(kClassName, modelClass)]
    } else if ((modelClass as Constructor).prototype instanceof Factory){
      const ob: Factory<any, any> = Reflect.construct((modelClass as Constructor), [undefined])
      defineModelProperty(_this, key, isArray ? value.map((item: any) => ob.parse(item)) : ob.parse(value))
      continue
    }

    if (isArray){
      defineModelProperty(_this, key, value.map((item: any) => Reflect.construct((modelClass as Constructor), [item, options._id])))
    } else {
      defineModelProperty(_this, key, Reflect.construct((modelClass as Constructor), [value, options._id]))
    }
  }

  return new Proxy(_this, {
    set(target: KeyValue, p: string | symbol, newValue: any): boolean {
      if(!target[kNew] && newValue != target[p]){
        target[kDirtyFields].add(p)
      }
      target[p] = newValue
      return true
    }
  })
}

function savableRef(item: any){
  if (item instanceof ObjectId) return item
  else if (typeof item == "string") return new ObjectId(item)
  return item._id
}

function jsonableRef(item: any, klass: any){
  if (item instanceof ObjectId) return item.toString()
  else if (typeof item == "string") return item
  return toObject(item, false, true)
}


export function toObject(_this: KeyValue, savable: boolean = false, toJson: boolean = false, fields?: Set<string>) {
  const fieldProperties: PropertiesMeta = Reflect.getMetadata(kFieldPropertiesMeta, _this.constructor) || {}
  const obj: {[key: string]: any} = {}
  for(const key in fieldProperties){
    if (fields && !fields.has(key)){
      continue
    }
    let { isArray, options, isRef } = fieldProperties[key]
    const payloadKey = savable ? options.name || key : key
    const value = _this[key]

    if (value == undefined){
      continue
    }

    let modelClass = options.type

    if (!value || !modelClass){
      obj[payloadKey] = value
      continue
    }

    if (isRef && savable){
      obj[payloadKey] = isArray ? value.map((item: any) => savableRef(item)) : savableRef(value)
      continue
    } else if (isRef && toJson){
      obj[payloadKey] = isArray ? value.map((item: any) => jsonableRef(item, modelClass)) : jsonableRef(value, modelClass)
      continue
    }

    if ((modelClass as Constructor).prototype instanceof Base.constructor || (modelClass as Constructor).prototype instanceof Base){
      obj[payloadKey] = isArray ? value.map((item: any) => toObject(item, savable, toJson)) : toObject(value, savable, toJson)
    } else if ((modelClass as Constructor).prototype instanceof Factory){
      const ob: Factory<any, any> = Reflect.construct((modelClass as Constructor), [undefined])
      obj[payloadKey] = isArray ? value.map((item: any) => ob.value(item)) : ob.value(value)
    } else {
      obj[payloadKey] = _this[key]
    }
  }
  if (toJson && _this._id){
    obj["_id"] = _this._id.toString()
  } else if (_this._id){
    obj["_id"] = _this._id
  }
  return obj
}


export interface ModelOptions<T> {
  collection?: string
  indexes?: ModelIndex<T>[]
  connection?: Connection
}

export function model<T>(options?: ModelOptions<T>) {

  return function <T extends Constructor> (klass: T) {

    const collectionName = options?.collection || `${klass.name.toLowerCase()}s`
    const connection = options?.connection || defaultConnection

    const bulkOpBuilder = new BulkOpBuilder<T>(klass.name)
    const modelMeta = new ModelMeta(collectionName, klass.name)

    const newClass = class Model extends klass {

      constructor(...args: any[]) {
        super();
        const proxy = init(this, args[0], args[1])
        this._ob = proxy
        return proxy
      }

      [kDirtyFields]: Set<string> = new Set();
      [kNew]: boolean = true;

      static readonly BulkOp: BulkOpBuilder<T> = bulkOpBuilder

      async save(fields?: Field<T>[]) {
        if (this[kNew]){
          const savableObject = toObject(this, true)
          await connection.client.db().collection(modelMeta.collectionName).insertOne(savableObject as any)
          this[kNew] = false
        } else {
          const updateDoc: any = toObject(this, true, false, fields ? new Set(fields as any) : this[kDirtyFields])
          await Model.find({_id: this._id}).update({$set: updateDoc}).one()
          this[kDirtyFields].clear()
        }
        return this
      }

      toObject(): T {
        return toObject(this, false) as any
      }

      toJSON(){
        return toObject(this, false, true)
      }

      async delete(): Promise<DeleteResult> {
        return connection.client.db().collection<any>(modelMeta.collectionName).deleteOne({_id: this._id})
      }

      static find(filter: Filter<T> = {}, options?: FindOptions): FindQuery<T> {
        return new FindQuery<T>(
          connection,
          modelMeta,
          filter,
          options
        )
      }

      static async create(docs: Array<ModelProps<T> | T>): Promise<T[]>;
      static async create(doc: ModelProps<T> | T): Promise<T>;
      static async create(docs: Array<ModelProps<T> | T> | ModelProps<T> | T , options: InsertOneOptions = {}): Promise<T[] | T>{
        const ModelClass = getModelClass<T>(modelMeta.modelClassName)
        if (Array.isArray(docs)){
          const docObjs = docs.map(doc => doc instanceof ModelClass ? withSavedModelMetadata(doc) : new ModelClass(doc, true, true))
          await connection.client.db().collection(modelMeta.collectionName).insertMany(docObjs.map(doc => toObject(doc, true)), options)
          return docObjs
        }
        const obj: any = docs instanceof ModelClass ? withSavedModelMetadata(docs) : new ModelClass(docs, true, true)
        const savableObject = toObject(obj, true)
        await connection.client.db().collection(modelMeta.collectionName).insertOne(savableObject as any, options)
        return obj
      }

      static async aggregate(pipeline?: KeyValue[], options?: AggregateOptions): Promise<any[]> {
        return connection.client?.db().collection(modelMeta.collectionName).aggregate(pipeline, options).toArray() as any
      }

      static bulkWrite(ops: BulkOp<T>[]){
        return new BulkWrite<T>(connection, modelMeta, ops)
      }
    }

    const NameToClassMapMetadata = Reflect.getMetadata(kNameToClassMap, Base.constructor) || {}
    NameToClassMapMetadata[klass.name] = newClass

    Reflect.defineMetadata(kNameToClassMap, NameToClassMapMetadata, Base.constructor)
    Reflect.defineMetadata(kClassName, klass.name, klass)

    if (options?.indexes){
      for(let item of options.indexes){
        index(item.fields, item.options)(klass)
      }
    }
    connection.queueIndex(modelMeta, klass)
    return newClass
  }
}