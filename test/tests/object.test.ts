import {Basic} from "../models/Basic";
import {ObjectId} from "mongodb";


it('should initialize objects with given values', async () => {
  const b = new Basic({email: "johndoe@example.com"})
  expect(b.email).toBe("johndoe@example.com")
});

it('should initialize with default values when value not provided', async () => {
  const b = new Basic()
  expect(b.password).toBe("unusable")
});

it('should prioritize provided values over default values', async () => {
  const b = new Basic({password: "pa$$word"})
  expect(b.password).toBe("pa$$word")
});

it('should initialize with _id field', async () => {
  const b = new Basic()
  expect(b._id).toBeInstanceOf(ObjectId)
});

it('should have undefined values for fields which are not initialized', async () => {
  const b = new Basic()
  expect(b.firstName).toBeUndefined()
});


it('should have undefined values for fields which are not initialized in toObject()', async () => {
  const b = new Basic({lastName: "Doe"})
  expect(b.toObject()["firstName"]).toBeUndefined()
  expect(b.toObject()["lastName"]).not.toBeUndefined()
});

it('should set assigned value', async () => {
  const b = new Basic({lastName: "Doe"})
  b.firstName = "John"
  expect(b.firstName).toBe("John")
});