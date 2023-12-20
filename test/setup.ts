import {connection} from "../src";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conn = await connection.connect(mongoServer.getUri(), {monitorCommands: true})
  await conn.db().dropDatabase()
});

afterAll(async () => {
  await connection.disconnect();
  await mongoServer?.stop()
});