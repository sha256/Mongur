import {Basic} from "../models/Basic";


it('should perform multiple actions using bulk write', async () => {

  await Basic.create({email: "sep@bulk.co", firstName: "Separately created"})

  const bulkResult = await Basic.bulkWrite([
    Basic.BulkOp.create(new Basic({firstName: "This is good", email: "b1@bulk.co"})),
    Basic.BulkOp.create({firstName: "This is good", email: "b1@bulk.co"}),
    Basic.BulkOp.create(new Basic({firstName: "Another Bulk", email: "b2@bulk.co"})),
    Basic.BulkOp.find({email: "sep@bulk.co"}).update({$set: {firstName: "Bulk Updated"}}).one()
  ])

  expect(bulkResult.ok).toEqual(1)
  expect(bulkResult.insertedCount).toEqual(3)
  expect(bulkResult.modifiedCount).toEqual(1)
});


it('should be able to add bulkOp using the addOp method', async () => {

  const bulkOps = Basic.bulkWrite([
    Basic.BulkOp.create(new Basic({firstName: "This is good", email: "c1@bulk.co"})),
  ])

  bulkOps.addOp(Basic.BulkOp.create(new Basic({firstName: "This is good", email: "c2@bulk.co"})))

  const bulkResult = await bulkOps

  expect(bulkResult.ok).toEqual(1)
  expect(bulkResult.insertedCount).toEqual(2)
  expect(bulkResult.modifiedCount).toEqual(0)
});
