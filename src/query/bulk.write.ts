import {
  AnyBulkWriteOperation, BulkWriteResult,
  DeleteOptions, Filter,
  ReplaceOptions,
  UpdateFilter,
  UpdateOptions
} from "mongodb";
import {Connection, ModelMeta} from "../connection";
import {getModelClass} from "../utils";
import {ModelProps} from "../types";
import {toObject} from "../model";


// @ts-ignore
type BulkOperation<T> = AnyBulkWriteOperation<T>


export class BulkOp<T> {

  then(callback: (result: BulkOperation<T>) => any){
    callback({
      [this.key]: this.value
    } as any)
  }

  constructor(private key: string, private value: any, private keyOfOne: string) {
  }

  one(): BulkOp<T>{
    return new Promise(resolve => {
      resolve({
        [this.keyOfOne]: this.value
      })
    }) as any
  }

}


export class BulkFind<T> {

  constructor(private filter: Filter<T>, private one: boolean = false) {
  }

  update(query: UpdateFilter<T>, options?: UpdateOptions){
    return new BulkOp<T>(
      "updateMany",
      {
        filter: this.filter,
        update: query,
        ...options
      },
      "updateOne"
    )
  }

  delete(options?: DeleteOptions){
    return new BulkOp<T>(
      "deleteMany",
      {
        filter: this.filter,
        ...options
      },
      "deleteOne"
    )
  }

  replace(replacement: T, options?: ReplaceOptions){
    return new BulkOp<T>(
      "replaceOne",
      {
        filter: this.filter,
        replacement,
        ...options
      },
      "replaceOne"
    )
  }

}


export class BulkOpBuilder<T> {

  constructor(private className: string) {
  }

  create(init: T | ModelProps<T>): BulkOp<T> {
    return new Promise(resolve => {
      const ModelClass = getModelClass<T>(this.className)
      const obj = init instanceof ModelClass ? init : new ModelClass(init)
      resolve({
        insertOne: {
          document: toObject(obj as any, true)
        }
      })
    }) as any
  }

  find(filter: Filter<T>){
    return new BulkFind<T>(filter, false)
  }
}


export class BulkWrite<T> {

  constructor(
    private connection: Connection,
    private modelMeta: ModelMeta,
    private ops: BulkOp<T>[]
  ) {
  }

  addOp(op: BulkOp<T>): this {
    this.ops.push(op)
    return this
  }

  then(callback: (result: BulkWriteResult) => any){
    Promise.all(this.ops).then(allOps => {
      this.connection?.client!.db().collection<any>(this.modelMeta.collectionName)
        .bulkWrite(allOps as any).then((value) => {
        callback(value)
      })
    })
  }

}
