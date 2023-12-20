import {model, Model, field, Ref} from "../../src";


@model()
export class Address extends Model<Address>(){
  @field()
  street?: string

  @field()
  city?: string

}


@model()
export class Product extends Model<Product>(){
  @field()
  title?: string
}

@model()
export class User extends Model<User>(){
  @field()
  name?: string

  @field({ref: [Product]})
  products?: Ref<Product>[]
}

@model()
export class ModelWithRef extends Model<ModelWithRef>() {

  @field({unique: true})
  email!: string;

  @field()
  name?: string

  @field({ref: Address})
  address?: Ref<Address>

  @field({ref: [Product]})
  products?: Ref<Product>[]

  @field({type: [User]})
  users?: User[]

}