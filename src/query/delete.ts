import {Connection} from "../connection";
import {ModelMeta} from "../common";
import {DeleteOptions, DeleteResult, Filter} from "mongodb";
import {FindOptions} from "./find";


abstract class DeleteBaseQuery<T> {
  constructor(
    protected connection: Connection,
    protected modelMeta: ModelMeta,
    protected filter: Filter<T>,
    protected findOptions: FindOptions,
    protected deleteOptions?: DeleteOptions)
  {
  }
}

export class DeleteManyQuery<T> extends DeleteBaseQuery<T>{

  then(callback: (result: DeleteResult) => any){
    this.connection?.client!.db().collection(this.modelMeta.collectionName)
      .deleteMany(this.filter, this.deleteOptions as any).then((value) => {
      callback(value)
    })
  }

  one(): DeleteOneQuery<T> {
    return new DeleteOneQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this.findOptions
    )
  }
}

export class DeleteOneQuery<T> extends DeleteManyQuery<T> {

  then(callback: (result: DeleteResult) => any){
    this.connection?.client!.db().collection(this.modelMeta.collectionName)
      .deleteOne(this.filter, this.deleteOptions as any).then((value) => {
      callback(value)
    })
  }

  return(){
    return new DeleteOneReturnQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this.findOptions
    )
  }
}

export class DeleteOneReturnQuery<T> extends DeleteBaseQuery<T>{

  then(callback: (result: T) => any){
    const options = {...this.findOptions, ...this.deleteOptions}
    this.connection?.client!.db().collection(this.modelMeta.collectionName)
      .findOneAndDelete(this.filter, options as any).then((value) => {
      callback(value.value as any)
    })
  }
}