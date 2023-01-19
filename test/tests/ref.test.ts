import {Address, ModelWithRef} from "../models/ModelWithRef";
import {ObjectId} from "mongodb";


it('should initialize indexes', async () => {
  await ModelWithRef.create({email: "sha@gmail.com"})
  const address = new Address({city: "Dhaka"})
  await address.save()
  const u = new ModelWithRef({email: "test333@example.com"})
  u.address = address
  await u.save()

  const retrieved = await ModelWithRef.find({email: "test333@example.com"}).one().orThrow()
  expect(retrieved.address).toBeInstanceOf(ObjectId)

});
