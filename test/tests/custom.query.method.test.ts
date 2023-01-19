import {ModelWithQueryMethod} from "../models/ModelWithQueryMethod";

it('should query using custom query method', async () => {
  const obj = new ModelWithQueryMethod({firstName: "Model", email: "test@example.com"})
  await obj.save()
  const retrieved = await ModelWithQueryMethod.findByEmail("test@example.com")
  expect(obj.firstName).toBe(retrieved?.firstName)
});