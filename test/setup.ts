import {connection} from "../src";

beforeAll(async () => {
  const uri = process.env.__MONGODB_URI!
  await connection.connect(uri, {monitorCommands: true})
});

afterAll(async () => {
  await connection.disconnect();
});