import {User} from "../models/ModelFromBase";


it('should give access to base methods', async () => {
  const user = new User({lastName: "Shamim", firstName: "Model"})
  expect(user.firstName).toBe(user.getFirstName())
});


it('should save base fields', async () => {
  const user = new User({lastName: "Shamim", firstName: "Model", email: "base@email.com"})
  await user.save()

  const retrieved = await User.find({email: "base@email.com"}).one().orThrow()
  expect(retrieved.firstName).toBe(user.firstName)
  expect(retrieved.firstName).toBe(user.getFirstName())

});