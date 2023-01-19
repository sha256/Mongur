import {ModelWithFactoryType, LatLng} from "../models/ModelWithFactoryType";

it('should work with custom types on fields', async () => {
  const model = new ModelWithFactoryType({location: {lng: 33.0, lat: 30.33}})
  expect(model.location).toBeInstanceOf(LatLng)
  await model.save()
  const retrieved = await ModelWithFactoryType.find({}).one().orThrow()
  expect(retrieved.location).toBeInstanceOf(LatLng)
});

