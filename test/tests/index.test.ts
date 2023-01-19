import {ModelWithIndex} from "../models/ModelWithIndex";
import {kModelIndexes} from "../../src/constant";


it('should initialize indexes', async () => {
  const indexes = Reflect.getMetadata(kModelIndexes, ModelWithIndex) || []
  expect(indexes.length).toBe(2)
  await ModelWithIndex.create({email: "sha@gmail.com"})
});
