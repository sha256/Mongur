import {ModelWithSubDoc} from "../models/ModelWithSubdoc";
import {Basic} from "../models/Basic";
import {ObjectId} from "mongodb";


it('should initialize with sub doc', async () => {
  const m = new ModelWithSubDoc({name: "Sub doc", basic: {firstName: "Basic First"}})
  expect(m.basic?._id).toBeInstanceOf(ObjectId)
  expect(m.basic).toBeInstanceOf(Basic)
});

it('should initialize with sub doc', async () => {
  const m = new ModelWithSubDoc({name: "Sub doc", basic: {firstName: "Basic First"}})
  await m.save()
  expect(m.basic?.firstName).toBe("Basic First")
});

it('should set sub docs _id fields to undefined if _id = false in field options', async () => {
  const m = new ModelWithSubDoc({name: "Sub doc", basicWithoutId: {firstName: "Basic First"}})
  await m.save()
  expect(m.basicWithoutId?._id).toBeUndefined()
});

it('should set sub docs array _id fields to undefined if _id = false in field options', async () => {
  const m = new ModelWithSubDoc({name: "Sub doc", basicArrayWithoutId: [{firstName: "Basic First"}]})
  await m.save()
  expect(m.basicArrayWithoutId).toBeInstanceOf(Array)
  expect(m.basicArrayWithoutId![0]._id).toBeUndefined()
});