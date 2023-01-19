import {field, Model, model} from "../../src";


class UserBaseModel {

  @field()
  firstName!: string

  getFirstName () {
    return this.firstName
  }

}


@model()
export class User extends Model<User & UserBaseModel>(UserBaseModel) {

  @field()
  email!: string

  @field()
  lastName!: string;

  @field()
  password?: string

}

// This gives type information on Base models' methods
export interface User extends UserBaseModel {}