import {Address, ModelWithRef, Product, User} from "../models/ModelWithRef";


it('should populate 1 level', async () => {
  const address = new Address({city: "Saint Martins2"})
  await address.save()
  const ob = await ModelWithRef.create({email: "pop3@gmail.com", address})
  const retrieved = await ModelWithRef.find({email: "pop3@gmail.com"}).one().orThrow().populate({
    path: "address"
  })
  expect(address._id.toString()).toBe((<Address>retrieved.address)._id.toString())
});


it('should populate array', async () => {
  const product1 = new Product({title: "Apple"})
  await product1.save()

  const product2 = new Product({title: "Mango"})
  await product2.save()

  const ob = await ModelWithRef.create({email: "pop4@gmail.com", products: [product1, product2]})

  const retrieved = await ModelWithRef.find({email: "pop4@gmail.com"}).one().populate({
    path: "products"
  })
  // @ts-ignore
  expect(["Mango", "Apple"]).toContain((<Product>retrieved.products![0]).title)

});


it('should populate level 2 array', async () => {
  const product1 = new Product({title: "Apple"})
  await product1.save()

  const product2 = new Product({title: "Mango"})
  await product2.save()

  const user1 = new User({name: "User1", products: [product1]})
  const user2 = new User({name: "User1", products: [product2]})

  const ob = await ModelWithRef.create({email: "pop5@gmail.com", users: [user2, user1]})

  const retrieved = await ModelWithRef.find({email: "pop5@gmail.com"}).one().populate({
    path: "users.products"
  }).orThrow()
  expect(["Mango", "Apple"]).toContain((<Product[]>retrieved.users![0].products)![0].title)

});



