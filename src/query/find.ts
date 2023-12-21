import "reflect-metadata"
import {
  CountDocumentsOptions,
  DeleteOptions, DistinctOptions,
  Filter,
  FindOptions as MongoFindOptions,
  ReplaceOptions, UpdateFilter,
  UpdateOptions
} from "mongodb";
import {getModelClass} from "../utils";
import {Connection} from "../connection";
import {DeleteManyQuery} from "./delete";
import {UpdateManyQuery} from "./update";
import {ReplaceOneQuery} from "./replace";
import {Constructor, KeyValue, ModelMeta, PopulateOption, PrefixedField} from "../common";
import {kBuiltOptions} from "../constant";
import {doPopulate} from "./populate";


export interface FindOptions extends MongoFindOptions {
  lean?: boolean,
  population?: PopulateOption[]
}


export class BaseFindQuery<T> {

  private readonly [kBuiltOptions]: FindOptions;

  protected readonly connection: Connection
  protected readonly filter: Filter<T>
  protected readonly modelMeta: ModelMeta

  constructor(connection: Connection, modelMeta: ModelMeta, filter: Filter<T>, options: FindOptions = {}) {
    this[kBuiltOptions] = options;
    this.connection = connection
    this.filter = filter
    this.modelMeta = modelMeta
  }

  lean(){
    this[kBuiltOptions].lean = true
    return this
  }

  skip(count: number): this {
    this[kBuiltOptions].skip = count
    return this
  }

  limit(count: number): this {
    this[kBuiltOptions].limit = count
    return this
  }

  private addSelect(key: string, value: number){
    const current = this[kBuiltOptions].projection
    if (!current){
      this[kBuiltOptions].projection = {[key]: value}
    } else if (current.hasOwnProperty(key) && current[key] != value) {
      delete current[key]
    } else if (Object.values(current).indexOf(value == 1 ? 0 : 1) < 0){
      this[kBuiltOptions].projection![key] = value
    }
  }

  /**
   * @example
   * ```typescript
   * //
   * Model.find({}).select("name", "age")
   * //
   * Model.find({}).select("-email")
   * ```
   * @param fields
   */
  select(...fields: PrefixedField<T>[]): this {
    for(let field of fields){
      const negative = field.startsWith("-")
      this.addSelect(negative ? field.substring(1): field, negative ? 0 : 1)
    }
    return this
  }

  project(value: KeyValue): this {
    this[kBuiltOptions].projection = value
    return this
  }

  min(value: KeyValue): this {
    this[kBuiltOptions].min = value
    return this
  }

  max(value: KeyValue): this {
    this[kBuiltOptions].max = value
    return this
  }

  hint(value: KeyValue): this {
    this[kBuiltOptions].hint = value
    return this
  }
  /**
   * Use `-fieldName` for descending sort and just `fieldName` for ascending sort
   *
   * @example
   * ```typescript
   * Model.find({}).sort("name", "-age")
   * ```
   * Or use an object
   * ```typescript
   * Model.find({}).sort({name: 1, age: -1})
   * ```
   */
  sort(...fields: (PrefixedField<T>| KeyValue)[]): this {
    this[kBuiltOptions].sort = fields.reduce((a: {[key:string]: any}, c) => {
      if (typeof c == "string"){
        const negative = c.startsWith("-")
        a[negative ? c.substring(1) : c] = negative ? -1 : 1
        return a
      }
      return {...a, ...c}
    }, {})
    return this
  }

  populate(populate: PopulateOption): this {
    this[kBuiltOptions].population = this[kBuiltOptions].population ? [...this[kBuiltOptions].population, populate]: [populate]
    return this
  }

  protected async doPopulate(results: T[], ModelClass: Constructor<T>){
    if (this[kBuiltOptions].population){
      for (let populate of this[kBuiltOptions].population){
        await doPopulate(ModelClass, results, populate)
      }
    }
  }

}

export class FindQuery <T> extends BaseFindQuery<T>{

  private async exec(): Promise<T[]> {
    const data = await this.connection.client!.db().collection<any>(this.modelMeta.collectionName).find(this.filter, this[kBuiltOptions]).toArray()
    if (this[kBuiltOptions].lean){
      return data
    }
    const ModelClass = getModelClass<T>(this.modelMeta.modelClassName)
    const result =  data.map(item => new ModelClass(item, true, false))
    await this.doPopulate(result, ModelClass)
    return result
  }

  then(callback: (result: T[]) => any){
    this.exec().then(res => {
      callback(res)
    })
  }

  one(): FindOneQuery<T>{
    return new FindOneQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this[kBuiltOptions]
    )
  }

  delete(options?: DeleteOptions){
    return new DeleteManyQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this[kBuiltOptions]
    )
  }

  update(value: UpdateFilter<T>, options?: UpdateOptions){
    return new UpdateManyQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this[kBuiltOptions],
      value,
      options
    )
  }

  replace(replacement: T, options?: ReplaceOptions){
    return new ReplaceOneQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this[kBuiltOptions],
      replacement,
      options
    )
  }

  async count(options: CountDocumentsOptions = {}): Promise<number> {
    const count = await this.connection.client.db()
      .collection(this.modelMeta.collectionName)
      .countDocuments(this.filter, options)
    return count || 0
  }

  async distinct(key: string, options: DistinctOptions = {}): Promise<any[]>{
    return await this.connection.client.db()
      .collection<any>(this.modelMeta.collectionName).distinct(key, this.filter, options)
  }

}

export class FindOneQuery<T> extends BaseFindQuery<T> {

  then(callback: (result: T | null) => any){
    this.exec().then(res => {
      callback(res)
    })
  }

  protected async exec(): Promise<T | null> {
    const data = await this.connection?.client!.db().collection<any>(this.modelMeta.collectionName).findOne(this.filter, this[kBuiltOptions])
    if (this[kBuiltOptions].lean){
      return data as any
    }
    const ModelClass = getModelClass<T>(this.modelMeta.modelClassName)
    const result = new ModelClass(data, true, false)
    await this.doPopulate( [result], ModelClass)
    return result
  }

  orThrow() {
    return new FindOneOrFailQuery<T>(
      this.connection,
      this.modelMeta,
      this.filter,
      this[kBuiltOptions]
    )
  }

}

class FindOneOrFailQuery<T> extends FindOneQuery<T> {

  then(callback: (result: T) => any){
    this.exec().then(res => {
      if (!res){
        throw new Error("not found")
      }
      callback(res)
    })
  }
}

