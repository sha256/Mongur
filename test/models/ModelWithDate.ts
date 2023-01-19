import {model, Model, field} from "../../src";


@model()
export class BasicDate extends Model<BasicDate>() {

  @field()
  created?: Date

}