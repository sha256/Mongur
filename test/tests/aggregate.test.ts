import {Basic} from "../models/Basic";


it('should do match in aggregate', async () => {

  await Basic.create({firstName: "Name"})
  await Basic.create({firstName: "Not Name"})

  const result = await Basic.aggregate([
    {$match: {firstName: "Name"}}
  ])
  expect(result.length).toBe(1)
  expect(result[0].firstName).toBe("Name")
});
