import {model, Model, field} from "../../src";


@model()
export class Basic extends Model<Basic>() {

  @field()
  firstName!: string;

  @field()
  lastName!: string;

  @field()
  email!: string;

  @field({default: "unusable"})
  password?: string

}