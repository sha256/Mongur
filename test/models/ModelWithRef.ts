import {model, Model, field, Ref} from "../../src";


@model()
export class Address extends Model<Address>(){
  @field()
  street?: string

  @field()
  city?: string

}


@model()
export class ModelWithRef extends Model<ModelWithRef>() {

  @field({unique: true})
  email!: string;

  @field()
  name?: string

  @field({type: Address})
  address?: Ref<Address>

}