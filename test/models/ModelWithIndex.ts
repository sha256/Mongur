import {model, Model, field} from "../../src";
import {index} from "../../src/decorator";


@model()
@index<ModelWithIndex>(["age", "-name"])
export class ModelWithIndex extends Model<ModelWithIndex>() {

  @field({unique: true})
  email!: string;

  @field()
  age?: number;
  
  @field()
  name?: string

}