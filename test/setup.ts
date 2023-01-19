import {connection, MongoClient} from "../src";
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connect = () => connection.connect()
export const disconnect = () => connection.disconnect()

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  connection.client = new MongoClient(mongoServer.getUri(), {monitorCommands: true})
  const conn = await connect()
  await conn.db().dropDatabase()
});

afterAll(async () => {
  await disconnect();
  mongoServer?.stop()
});