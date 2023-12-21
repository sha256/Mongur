const { MongoMemoryServer } = require('mongodb-memory-server');
const {connection} = require("../src/connection")

module.exports = async function(){
  const mongoServer = await MongoMemoryServer.create();
  global.__MMS_INSTANCE = mongoServer;
  const uri = process.env.__MONGODB_URI = mongoServer.getUri()

  const conn = await connection.connect(uri, {monitorCommands: true})
  await conn.db().dropDatabase()
  await connection.disconnect()
}
