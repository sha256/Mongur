import {AggregateOptions, Filter, InsertOneOptions, ObjectId} from "mongodb";
import {Field, ModelProps} from "./common";
import {BulkOp, BulkOpBuilder} from "./query/bulk.write";
import {FindOptions, FindQuery} from "./query/find";
import {Document} from "bson";


export class Base {

}

export type BaseConstructor<T extends Base> = { new(...args: any[]): T }

export function Model<T, U = undefined>(baseModel: BaseConstructor<Base> = Base){

  return class extends baseModel {
    /**
     * This class is only for typing. Actual implementation is in the `model` decorator.
     */

    public _id?: string | ObjectId

    static readonly BulkOp: BulkOpBuilder<T>

    constructor(init?: ModelProps<T, U>) {
      super();
    }

    toObject(): T & U {
      return {} as any
    }

    toJSON(): any {

    }

    async save(fields?: Field<T>[]): Promise<this>{
      return this
    }
    static find(filter: Filter<T> = {}, options?: FindOptions): FindQuery<T> {
      return null as any
    }

    static async create(docs: Array<ModelProps<T> | T>): Promise<T[]>;
    static async create(doc: ModelProps<T> | T): Promise<T>;
    static async create(docs: Array<ModelProps<T> | T> | ModelProps<T> | T , options: InsertOneOptions = {}): Promise<T[] | T>{
      return null as any
    }

    static async aggregate(pipeline?: Document[], options?: AggregateOptions): Promise<any[]> {
      return null as any
    }

    static bulkWrite(ops: BulkOp<T>[]){
      return null as any
    }
  }

}