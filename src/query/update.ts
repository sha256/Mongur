import {Connection} from "../connection";
import {ModelMeta} from "../common";
import {Filter, UpdateFilter, UpdateOptions, UpdateResult} from "mongodb";
import {FindOptions} from "./find";

abstract class UpdateBaseQuery<T> {
  constructor(
    protected connection: Connection,
    protected modelMeta: ModelMeta,
    protected filter: Filter<T>,
    protected findOptions: FindOptions,
    protected updateData: UpdateFilter<T>,
    protected updateOptions?: UpdateOptions)
  {

  }
}

export class UpdateManyQuery<T> extends UpdateBaseQuery<T>{


  then(callback: (result: UpdateResult) => any){
    this.connection?.client!.db().collection(this.modelMeta.collectionName)
      .updateMany(this.filter, this.updateData as any, this.updateOptions as any).then((value) => {
      callback(value as any)
    })
  }

  one() {
    return new UpdateOneQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this.findOptions,
      this.updateData,
      this.updateOptions
    )
  }
}

export class UpdateOneQuery<T> extends UpdateManyQuery<T> {

  then(callback: (result: UpdateResult) => any){
    this.connection?.client!.db().collection(this.modelMeta.collectionName)
      .updateOne(this.filter, this.updateData, this.updateOptions as any).then((value) => {
      callback(value)
    })
  }

  return(opts: {new?: boolean}){
    return new UpdateOneReturnQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this.findOptions,
      this.updateData,
      this.updateOptions
    )
  }
}

export class UpdateOneReturnQuery<T> extends UpdateBaseQuery<T>{

  then(callback: (result: T) => any){
    const options = {...this.findOptions, ...this.updateOptions}
    this.connection?.client!.db().collection(this.modelMeta.collectionName)
      .findOneAndUpdate(this.filter, options as any).then((value) => {
      callback(value.value as any)
    })
  }
}