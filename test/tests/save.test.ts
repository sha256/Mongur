import {User} from "../models/ModelFromBase";
import {Basic} from "../models/Basic";
import {kDirtyFields, kNew} from "../../src/constant";
import {BasicDate} from "../models/ModelWithDate";


it('should save models properly', async () => {
  const staff = new User({lastName: "Shamim", firstName: "Model", email: "ddx@example.com"})
  await staff.save()
  const retrieved = await User.find({email: "ddx@example.com"}).one()
  expect(staff.lastName).toBe(retrieved?.lastName)
});


it('should have same _id after saving', async () => {
  const staff = new User({lastName: "Shamim", firstName: "Model", email: "ddx2@example.com"})
  const _id = staff._id
  const saved = await staff.save()
  expect(_id).toBe(staff._id)
  expect(_id).toBe(saved._id)
  const retrieved = await User.find({email: "ddx2@example.com"}).one().orThrow()
  expect(_id!.toString()).toBe(retrieved._id!.toString())
});


it('should create single object using create method', async () => {
  const user = await User.create(new User({firstName: "Test"}))
  expect(user).toBeInstanceOf(User)
});


it('should create multiple objects using create method', async () => {
  const users = await User.create([new User({firstName: "Test"}), new User({firstName: "Test"})])
  expect(users.length).toBe(2)
  expect(users[0]).toBeInstanceOf(User)
});

it('should set new and dirty meta data', async () => {
  const b = new Basic({lastName: "Doe", email: "dirty@example.com"})
  b.firstName = "John"
  expect((b as any)[kNew]).toBe(true)
  expect((b as any)[kDirtyFields].size).toBe(0)
  await b.save()
  b.lastName = "Doe2"
  expect((b as any)[kDirtyFields].size).toBe(1)
});


it('should save and retrieve date properly', async () => {
  const date = new Date()
  const datable = new BasicDate({created: date})
  await datable.save()
  const retrieved = await BasicDate.find().one().orThrow()
  expect(date).toEqual(retrieved.created)
});

it('should not save extra properties', async () => {
  const p = {lastName: "Doe", email: "withextra@example.com", extra: "extra value"}
  const b = new Basic(p)
  await b.save()
  // @ts-ignore
  const getExtra = (ob) => ob.extra

  const retrieved = Basic.find({email: "withextra@example.com"}).one().orThrow()
  expect(getExtra(retrieved)).toBeUndefined()
});