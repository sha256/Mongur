import {model, Model, field} from "../../src";
import {Basic} from "./Basic";


@model()
export class ModelWithSubDoc extends Model<ModelWithSubDoc>() {

  @field()
  name!: string;

  @field({type: Basic})
  basic?: Basic

  @field({type: Basic, _id: false})
  basicWithoutId?: Basic

  @field({type: [Basic], _id: false})
  basicArrayWithoutId?: Basic[]

}