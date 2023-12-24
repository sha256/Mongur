import {model, Model, field} from "../../src";

export enum OrderStatus {
  Created = "Created",
  Processing = "Processing",
  Complete = 3
}

@model()
export class Order extends Model<Order>() {

  @field()
  amount?: number;

  @field({default: OrderStatus.Created})
  status!: OrderStatus;

}