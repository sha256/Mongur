import {field, Model, model} from "../../src";


@model({})
export class ModelWithQueryMethod extends Model<ModelWithQueryMethod>() {

  @field()
  email!: string;

  @field()
  firstName!: string;

  @field({default: "unusable"})
  password?: string

  static findByEmail(email: string){
    return ModelWithQueryMethod.find({email: email} as any).one()
  }

}