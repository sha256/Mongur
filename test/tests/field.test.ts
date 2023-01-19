import {User} from "../models/ModelFromBase";
import {ObjectId} from "mongodb";

it('should initialize with with _id field', async () => {
  const user = new User({lastName: "Firsts", firstName: "Lasts"})
  expect(user._id).toBeInstanceOf(ObjectId)
});
