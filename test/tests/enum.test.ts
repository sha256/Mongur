import {Order, OrderStatus} from "../models/ModelWithEnum";


it('should create model with enum', async () => {
  const order = new Order({amount: 10, status: OrderStatus.Created})
  await order.save()
});


it('should retrieve model with enum value', async () => {
  const order = await Order.find({status: OrderStatus.Created}).one().orThrow()
  expect(order.status).toBe(OrderStatus.Created)
});
