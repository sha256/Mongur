import {Connection} from "../connection";
import {ModelMeta} from "../common";
import {Filter, ReplaceOptions, UpdateResult} from "mongodb";
import {FindOptions} from "./find";

abstract class ReplaceBaseQuery<T> {
  constructor(
    protected connection: Connection,
    protected modelMeta: ModelMeta,
    protected filter: Filter<T>,
    protected findOptions: FindOptions,
    protected replacement: T,
    protected replaceOptions?: ReplaceOptions)
  {

  }
}


export class ReplaceOneQuery<T> extends ReplaceBaseQuery<T> {

  then(callback: (result: UpdateResult) => any){
    this.connection?.client!.db().collection<any>(this.modelMeta.collectionName)
      .replaceOne(this.filter, this.replaceOptions as any).then((value) => {
      callback(value as any)
    })
  }

  one() {
    return this
  }

  return(){
    return new ReplaceOneReturnQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this.findOptions,
      this.replacement,
      this.replaceOptions
    )
  }
}

export class ReplaceOneReturnQuery<T> extends ReplaceBaseQuery<T>{

  then(callback: (result: T) => any){
    const options = {...this.findOptions, ...this.replaceOptions}
    this.connection?.client!.db().collection<any>(this.modelMeta.collectionName)
      .findOneAndReplace(this.filter, options as any).then((value) => {
      callback(value.value as any)
    })
  }
}