import {User} from "../models/ModelFromBase";


it('should delete one object properly', async () => {
  const user = new User({lastName: "Shamim", firstName: "Model", email: "test2@example.com"})
  await user.save()

  const retrieved = await User.find({email: "test2@example.com"}).one()
  expect(user.lastName).toBe(retrieved?.lastName)

  const deletedCount = await User.find({email: "test2@example.com"}).delete().one()
  expect(deletedCount.deletedCount).toBe(1)

});


it('should delete and return when return called', async () => {
  const user = new User({lastName: "Shamim", firstName: "Model", email: "test2@example.com"})
  await user.save()

  const deletedObject = await User.find({email: "test2@example.com"}).delete().one().return()
  expect(deletedObject.lastName).toBe(user?.lastName)

});

it('should delete many objects properly', async () => {
  const user = new User({lastName: "Shamim", firstName: "Model", email: "xp@example.com"})
  await user.save()

  const user2 = new User({lastName: "Shamim2", firstName: "Model2", email: "xp@example.com"})
  await user2.save()

  const deleteResult = await User.find({email: "xp@example.com"}).delete()
  expect(deleteResult.deletedCount).toBe(2)

});
