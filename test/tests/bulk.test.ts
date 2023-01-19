import {Basic} from "../models/Basic";


it('should perform multiple actions using bulk write', async () => {

  await Basic.create({email: "sep@bulk.co", firstName: "Separately created"})

  const bulkResult = await Basic.bulkWrite([
    Basic.BulkOp.create(new Basic({firstName: "This is good", email: "b1@bulk.co"})),
    Basic.BulkOp.create({firstName: "This is good", email: "b1@bulk.co"}),
    Basic.BulkOp.create(new Basic({firstName: "Another Bulk", email: "b2@bulk.co"})),
    Basic.BulkOp.find({email: "sep@bulk.co"}).update({$set: {firstName: "Bulk Updated"}}).one()
  ]).addOp(Basic.BulkOp.create(new Basic({firstName: "This is good", email: "b3@bulk.co"})))

  expect(bulkResult.result.ok).toEqual(1)
  expect(bulkResult.result.nInserted).toEqual(4)
  expect(bulkResult.result.nModified).toEqual(1)
});
